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
  public function importXlsx(Node $node, $field_name): bool {
    try 
    {
      if (!$node->hasField($field_name) || $node->get($field_name)->isEmpty()) 
        return false;
      if(count($node->get('field_products')->getValue()) > 1)
        return false;

      $file = $node->get($field_name)->entity;
      if (!$file) {
        return false;
      }

      $file_path = $this->fileSystem->realpath($file->getFileUri());
      $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

      $rows = [];
      if ($extension === 'csv') {
        $rows = $this->readCsv($file_path);
      }
      elseif (in_array($extension, ['xlsx', 'xls'])) {
        $rows = $this->readXlsx($file_path);
      }
      foreach ($rows as $key => $row) {
        if($key > 0 && !empty($row[0]) && !empty($row[1])){
          $nids = $this->entityTypeManager
            ->getStorage('node')
            ->getQuery()
            ->condition('type', 'product')
            ->condition('field_id_unique', $row[0] ?? '')
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
                'field_id_unique' => $row[0] ?? '',
              ]);
          }
          $product->set('title', $row[1] ?? '');
          //$product->set('field_purchase_currency',  !empty($row[2]) ? ['target_id' => $row[2]] : '');
          $product->set('field_description', $row[3] ?? '');
          $product->set('field_unit_weight', $row[4] ?? '');

          if($product->save()){
            $paragraph = Paragraph::create([
              'type' => 'items', 
              'field_product' => [
                'target_id' => $product->id(),
              ],
            ]);
            if($paragraph->save()){
              $arrayParagraph = $node->get('field_products')->getValue() ?? [];
              $arrayParagraph[] = [
                'target_id' => $paragraph->id(),
                'target_revision_id' => $paragraph->getRevisionId(),
              ];
              $node->set('field_products', $arrayParagraph);
              $node->save();
            }
          }
        }
      }
      return TRUE;
    } catch (\Throwable $th) {
      $this->logger->error("Error import file ".$th->getMessage() );
      return FALSE;
    }
  }

  
  private function readCsv(string $file_path): array {
    $rows = [];
    if (($handle = fopen($file_path, 'r')) !== FALSE) {
      while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
        $rows[] = $data;
      }
      fclose($handle);
    }
    return $rows;
  }

  private function readXlsx(string $file_path): array {
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
