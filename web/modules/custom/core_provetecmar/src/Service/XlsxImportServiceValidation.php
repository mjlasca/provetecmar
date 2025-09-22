<?php

namespace Drupal\core_provetecmar\Service;

use GuzzleHttp\ClientInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\node\Entity\Node;
use Drupal\Core\File\FileSystemInterface;
use Drupal\paragraphs\Entity\Paragraph;
use PhpOffice\PhpSpreadsheet\IOFactory;



/**
 * Service for import xlsx to create products
 */
class XlsxImportServiceValidation {

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
  public function importXlsxValidation(Node $node, $field_name): array {
    try 
    {
      
      if (!$node->hasField($field_name) || $node->get($field_name)->isEmpty()) 
        return ['success' => TRUE, 'message' => ''];
      if(count($node->get('field_products')->getValue()) > 1)
        return ['success' => TRUE, 'message' => ''];

      $file = $node->get($field_name)->entity;
      if (!$file) {
        return ['success' => TRUE, 'message' => ''];
      }
      

      $file_path = $this->fileSystem->realpath($file->getFileUri());
      $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
      
      $rows = [];
      
      if (in_array($extension, ['xlsx', 'xls'])) {
        $rows = $this->readXlsx($file_path);
      }else{
        return ['success' => FALSE, 'message' => 'El archivo debe ser xlsx o xls'];
      }

      $message = '';
      foreach ($rows as $key => $row) {

        if($key > 5 && !empty($row[2]) && !empty($row[3]) && !empty($row[4]) ){
          if(empty($row[2]))
              $message .= "<li>El código es obligatorio. Item #$row[1]</li>";
          if(empty($row[3]))
              $message .= "<li>El nombre es obligatorio. Item #$row[1]</li>";
          if(empty($row[4]))
              $message .= "<li>La descripción es obligatoria. Item #$row[1]</li>";
          if(empty($row[6]))
              $message .= "<li>El parte es obligatorio. Item #$row[1]</li>";
          if(empty($row[7]))
              $message .= "<li>La cantidad es obligatoria. Item #$row[1]</li>";
          if(empty($row[8]))
              $message .= "<li>La unidad de medida es obligatoria. Item #$row[1]</li>";
          if(!empty($row[7]) && !is_numeric(trim($row[7])))
            $message .= "<li>La cantidad no es un número. Item #$row[1]</li>";
          
          $unit = $this->validateTaxonomy('unit_of_measurement',$row[8]);
          if($unit == FALSE)
            $message .= "<li>La unidad de medida $row[8] no es correcta. Item #$row[1]</li>";
          if(!empty($row[5])){
            $manufacturer = $this->validateTaxonomy('manufacturer',$row[5]);
            if($manufacturer == FALSE)
              $message .= "<li>El fabricante $row[5] no es correcto. Item #$row[1]</li>";
          }  
        }
      }

      if(!empty($message)){
        return ['success' => FALSE, 'message' => $message];
      }else{
        return ['success' => TRUE, 'message' => 'Se generó correctamente la importación'];
      }
    } catch (\Throwable $th) {
      $this->logger->error("Error import file ".$th->getMessage() );
      return ['success' => FALSE, 'message' => "Hubo un error en el proceso de importación ".$th->getMessage()];
    }
  }

  private function validateTaxonomy($vid, $name){
    $name = trim($name);
    if(empty($name))
      return FALSE;
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
    $reader = IOFactory::createReaderForFile($file_path);
    $reader->setReadDataOnly(TRUE); // Solo valores, sin estilos
    $reader->setReadEmptyCells(FALSE); // Ignora celdas vacías
    $spreadsheet = $reader->load($file_path);
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
