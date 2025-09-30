<?php

namespace Drupal\core_provetecmar\Service;

use GuzzleHttp\ClientInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\file\FileRepositoryInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\node\Entity\Node;
use Drupal\Core\File\FileSystemInterface;

/**
 * Validate quote content type
 */
class ValidateQuoteService {

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
     * Function for validate pargraphs quote
     * @param Drupal\node\Entity\Node  $node
     *  Node from quote content type
     * @return
     *  array
     */
    function validateQuote(Node $node, $form, $form_state) : array {
        $formValues = $form_state->getValues();
        if(isset($formValues['moderation_state'][0]['value']) && $formValues['moderation_state'][0]['value'] == 'price_change'){
            $resultError = [];
            foreach ($node->get('field_products')->referencedEntities() as $k => $paragraph) {
              if (!empty($paragraph->get('field_product')->target_id)) {
                $product_entity = $paragraph->get('field_product')->entity;
                $resPro = $this->validateProduct($product_entity);
                if(!$resPro['success'])
                  $resultError[] = ['msg' => $resPro['msg']."<br>", 'k' => $k];
              }
            }
            if(!empty($resultError)){
              return ['success' => FALSE, 'message' => $resultError];
            }
      }

      return ['success' => TRUE];
      
    }

    /**
     * Function for validate product
     * @param Drupal\node\Entity\Node  $product
     *  Node from product
     * @return array
     *  Message validation for success true or false
     */
    function validateProduct(Node $product) : array {
      if(
        $product->field_unit_weight->value != 0 &&
        $product->field_unit_cost->value != 0 &&
        $product->field_provider->target_id != ''
      ){
        return ['success' => TRUE];
      }else{
        return ['success' => FALSE, 'msg' => "El producto {$product->title->value} no está completo"];
      }
    }

}
