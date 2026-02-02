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

/**
 * Save lines paragraphs quote service
 */
class SetLinesQuoteService {

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
     * Function for get parameters
     * @param Node $node
     *  Nodo quote
     * @return
     *  array
     */
    function saveLines($data) : array {
      $node = $data['node'];
      $paragraph = [];
      $arrayParagraph = [];
        try {
          foreach ($data['lines'] as $k => $line) {
            $paragraph = Paragraph::create([
              'type' => 'items',
              'field_cant' => $line['field_cant'],
              'field_product' => [ 'target_id' => $line['nid']],
              'field_weight_total' => $line['field_weight_total'],
              'field_total' => $line['field_total'],
              'field_delivery_region' => [ 'target_id' => $line['field_delivery_region']],
              'field_company' => [ 'target_id' => $line['field_company']],
              'field_currency_line' => [ 'target_id' => $line['field_currency_line']],
              'field_tax' => $line['field_tax'],
              'field_cost' => $line['field_cost'],
              'field_total_cost' => $line['field_total_cost'],
              'field_assessment' => [ 'target_id' => $line['field_assessment']],
              'field_margin' => [ 'target_id' => $line['field_margin']],
              'field_incoterm' => [ 'target_id' => $line['field_incoterm']],
              'field_landed_cost' => $line['field_landed_cost'],
              'field_shipping_method' => [ 'target_id' => $line['field_shipping_method']],
              'field_container_type' => [ 'target_id' => $line['field_container_type']],
              'field_qty' => $line['field_qty'],
              'field_container_delivery' => [ 'target_id' => $line['field_container_delivery']],
              'field_unit_sale' => $line['field_unit_sale'],
              'field_total_sale' => $line['field_total_sale'],
              'field_sale_factor' => $line['field_sale_factor'],
              'field_delivery_time' => $line['field_delivery_time'],
              'field_delivery_time_client' => $line['field_delivery_time_client'],
              'field_comments' => $line['field_comments'],
              'field_brand' => $line['field_brand'],
            ]);
            if($node->type->target_id == 'purchase_order')
              $paragraph->set('field_check',$line['field_check']);
            if($paragraph->save()){
              $arrayParagraph[] = [
                'target_id' => $paragraph->id(),
                'target_revision_id' => $paragraph->getRevisionId(),
              ];
            }
          }
          $node->set('field_products', $arrayParagraph);
          $node->save();
          return ['success' => TRUE, 'paragraphs' => $node->get('field_products')->referencedEntities()];
      } catch (\Throwable $th) {
        return ['success' => FALSE];
      }
    }


}
