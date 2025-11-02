<?php

namespace Drupal\core_provetecmar\Service;

use GuzzleHttp\ClientInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\node\Entity\Node;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use Drupal\paragraphs\Entity\Paragraph;
use PhpOffice\PhpSpreadsheet\IOFactory;



/**
 * Service for import xlsx to create products
 */
class XlsxImportService {

   /**
     * @param \GuzzleHttp\ClientInterface $http_client
     *   The HTTP client service used to make external API requests.
     */
    protected $httpClient;
    /**
     * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
     *   The logger factory service used to get a logger channel for this module.
     */
    protected $logger;
    /**
     * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
     *   Manage storage entity
     */
    protected $entityTypeManager;
    /**
     * @param \Drupal\file\FileRepositoryInterface $fileRepository
     *   Manage files
     */
    protected FileRepositoryInterface $fileRepository;
    /**
     * @param \Drupal\Core\File\FileUrlGeneratorInterface $fileUrlGenerator
     *   Generate url's
     */
    protected FileUrlGeneratorInterface $fileUrlGenerator;
    /**
     * @param  \Drupal\Core\File\FileSystemInterface
     *   Manage files
     */
    protected FileSystemInterface $fileSystem;

    /**
     * Constructs a new ValidadorAcceso service.
     *
     * @param \GuzzleHttp\ClientInterface $http_client
     *   The HTTP client service used to make external API requests.
     * 
     * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
     *   The logger factory service used to get a logger channel for this module.
     * 
     * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
     *   Manage storage entity
     * 
     * @param \Drupal\file\FileRepositoryInterface $fileRepository
     *   Manage files
     * 
     * @param \Drupal\Core\File\FileUrlGeneratorInterface $fileUrlGenerator
     *   Generate url's
     * 
     * @param \Drupal\Core\File\FileSystemInterface $fileSystem
     *   Manage files
     */
    public function __construct(
        ClientInterface $http_client,
        LoggerChannelFactoryInterface $logger_factory,
        EntityTypeManagerInterface $entityTypeManager,
        FileRepositoryInterface $fileRepository,
        FileUrlGeneratorInterface $fileUrlGenerator,
        FileSystemInterface $fileSystem
        ) {
        $this->httpClient = $http_client;
        $this->logger = $logger_factory->get('core_provetecmar');
        $this->entityTypeManager = $entityTypeManager;
        $this->fileRepository = $fileRepository;
        $this->fileUrlGenerator = $fileUrlGenerator;
        $this->fileSystem = $fileSystem;
    }

  /**
   * Retorna un saludo, usando cache y dejando trazas en el log.
   * @return bool
   *  Succes or not create products and paragraphs add
   */
  public function importXlsx($form, $form_state): array {
    try 
    {
      $nodeQuote = $form_state->getFormObject()->getEntity();
      if(count($nodeQuote->get('field_products')->getValue()) > 0){
        return ['success' => TRUE];
      }
      $file_input = $form_state->getValue(['field_items_import', 0]);
      if(empty($file_input['fids']) || !isset($file_input['fids'][0]) )
        return ['success' => TRUE];
      if (!empty($file_input['fids'][0])) {
        $fid = $file_input['fids'][0];
        $file = File::load($fid);
      }

      $file_path = $this->fileSystem->realpath($file->getFileUri());
      $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
      
      $rows = [];
      
      if (in_array($extension, ['xlsx', 'xls'])) {
        $rows = $this->readXlsx($file_path);
      }else{
        return ['success' => FALSE, 'message' => 'El archivo debe ser xlsx o xls'];
      }

      foreach ($rows as $key => $row) {
        
        if($key > 1 && !empty($row[1]) && !empty($row[2]) && !empty($row[3]) ){
          
          $nids = $this->entityTypeManager
            ->getStorage('node')
            ->getQuery()
            ->condition('type', 'product')
            ->condition('field_part', $row[6] ?? '')
            ->accessCheck(FALSE)
            ->execute();
          
          if (!empty($nids)) {
            $nid = reset($nids);
            $product = $this->entityTypeManager
              ->getStorage('node')
              ->load($nid);
          } else {
            $product = $this->entityTypeManager
              ->getStorage('node')
              ->create([
                'type' => 'product',
                'field_part' => $row[6] ?? '',
              ]);
          }
          if($product){
            $unit = $this->validateTaxonomy('unit_of_measurement',$row[8]);
            if($unit != FALSE)
              $product->set('field_unit',$unit);
            if(!empty($row[4])){
              $manufacturer = $this->validateTaxonomy('manufacturer',$row[4]);
              if($manufacturer != FALSE)
                $product->set('field_manufacturer',$manufacturer);
            }  
            $product->set('title', str_replace('"','', $row[2] ) ?? '');
            $product->set('field_description', $row[3] ?? '');

            if($product->save()){
              $paragraphProd = [
              'type' => 'items', 
              'field_product' => [
                'target_id' => $product->id(),
                ]
              ];
              if(!empty($row[7]) && $row[7])
                $paragraphProd['field_cant'] = trim($row[7]);
              if(!empty($row[9]) && $row[9])
                $paragraphProd['field_comments'] = trim($row[9]);
              
              $paragraph = Paragraph::create($paragraphProd);
              if($paragraph->save()){
                $arrayParagraph = $nodeQuote->get('field_products')->getValue() ?? [];
                $arrayParagraph[] = [
                  'target_id' => $paragraph->id(),
                  'target_revision_id' => $paragraph->getRevisionId(),
                ];
                $nodeQuote->set('field_products', $arrayParagraph);
                $nodeQuote->save();
              }
            }
          }
        }
      }
      return ['success' => TRUE, 'message' => 'Se generó correctamente la importación'];
    } catch (\Throwable $th) {
      $this->logger->error("Error import file ".$th->getMessage() );
      return ['success' => FALSE, 'message' => "Hubo un error en el proceso de importación ".$th->getMessage()];
    }
  }

  private function validateTaxonomy($vid, $name){
    $tax = $this->entityTypeManager
              ->getStorage('taxonomy_term')
              ->loadByProperties([
                'vid' => $vid,
                'name' => strtoupper($name),
              ]);
    if(!empty($tax))
      return reset($tax)->tid->value;
    return FALSE;
  }


  public function readXlsx(string $file_path): array {
    $rows = [];
    $spreadsheet = IOFactory::load($file_path);
    $sheet = $spreadsheet->getActiveSheet();

    foreach ($sheet->getRowIterator() as $row) {
      $cellIterator = $row->getCellIterator();
      $cellIterator->setIterateOnlyExistingCells(FALSE);

      $row_data = [];
      foreach ($cellIterator as $cell) {
        $row_data[] = $cell->getValue();
      }
      $rows[] = $row_data;
    }

    return $rows;
  }

}
