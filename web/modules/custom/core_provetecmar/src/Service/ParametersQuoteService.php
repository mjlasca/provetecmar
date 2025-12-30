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
 * Sete parameters quote
 */
class ParametersQuoteService {

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
    function getData(Node $node) : array {
      $result = [];
      foreach ($node->get('field_products')->referencedEntities() as $k => $paragraph) {
        if (!empty($paragraph->get('field_product')->target_id)) {
          $result[] = [
            'field_check'             => $paragraph->get('field_check')->value ?? NULL,
            'field_product'           => $paragraph->get('field_product')->entity->title->value ?? NULL,
            'cost_unit'               => $paragraph->get('field_product')->entity->field_unit_cost->value ?? NULL,
            'currency'                => $paragraph->get('field_product')->entity->field_purchase_currency->target_id ?? NULL,
            'name'                    => $paragraph->get('field_product')->entity->title->value ?? NULL,
            'nid'                     => $paragraph->get('field_product')->target_id ?? NULL,
            'provider'                => $paragraph->get('field_product')->entity->field_provider->target_id ?? NULL,
            'weight'                  => $paragraph->get('field_product')->entity->field_unit_weight->value ?? NULL,
            'field_cant'              => $paragraph->get('field_cant')->value ?? NULL,
            'field_currency_line'     => $paragraph->get('field_currency_line')->target_id ?? NULL,
            'field_weight_total'      => $paragraph->get('field_weight_total')->value ?? NULL,
            'field_total'             => $paragraph->get('field_total')->value ?? NULL,
            'field_company'           => $paragraph->get('field_company')->target_id ?? NULL,
            'field_delivery_region'   => $paragraph->get('field_delivery_region')->target_id ?? NULL,
            'field_tax'               => $paragraph->get('field_tax')->value ?? NULL,
            'field_cost'              => $paragraph->get('field_cost')->value ?? NULL,
            'field_total_cost'        => $paragraph->get('field_total_cost')->value ?? NULL,
            'field_assessment'        => $paragraph->get('field_assessment')->target_id ?? NULL,
            'field_margin'            => $paragraph->get('field_margin')->target_id ?? NULL,
            'field_incoterm'          => $paragraph->get('field_incoterm')->target_id ?? NULL,
            'field_brand'        => $paragraph->get('field_brand')->target_id ?? NULL,
            'field_landed_cost'       => $paragraph->get('field_landed_cost')->value ?? NULL,
            'field_shipping_method'   => $paragraph->get('field_shipping_method')->target_id ?? NULL,
            'field_container_type'    => $paragraph->get('field_container_type')->target_id ?? NULL,
            'field_qty'               => $paragraph->get('field_qty')->value ?? NULL,
            'field_container_delivery'=> $paragraph->get('field_container_delivery')->target_id ?? NULL,
            'field_unit_sale'         => $paragraph->get('field_unit_sale')->value ?? NULL,
            'field_total_sale'        => $paragraph->get('field_total_sale')->value ?? NULL,
            'field_sale_factor'       => $paragraph->get('field_sale_factor')->value ?? NULL,
            'field_delivery_time'     => $paragraph->get('field_delivery_time')->value ?? NULL,
            'field_delivery_time_client'     => $paragraph->get('field_delivery_time_client')->value ?? NULL,
            'field_comments'          => $paragraph->get('field_comments')->value ?? NULL,
          ];
        }
      }
      return $result;
    }


    /**
     * Function for get parameters
     * @param Node $node
     *  Node entity
     * @return
     *  array
     */
    function getParameters(Node $node) : array {
      $settings = [];
      $rfqs = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'group_companies'
      ]);
      if(!empty($rfqs)){
        $settings['group_companies'][] = ['name' => '--Empresa--', 'tid' => ''];
        foreach ($rfqs as $k => $rfq) {
          $settings['group_companies'][] = [
            'tid' => $rfq->tid->value,
            'name' => $rfq->name->value,
          ];
        }
      }

      $assessment = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'assessment'
      ]);
      if(!empty($assessment)){
        foreach ($assessment as $k => $val) {
          $settings['assessment'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
        sort($settings['assessment']);
      }

      $shipping_method = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'shipping_method'
      ]);
      if(!empty($shipping_method)){
        $settings['shipping_method'][] = ['name' => '--Método de envío--', 'tid' => ''];
        foreach ($shipping_method as $k => $val) {
          $settings['shipping_method'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $brand_line = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([  
        'vid' => 'brand_line'
      ]);
      if(!empty($brand_line)){
        $settings['brand_line'][] = ['name' => '--Marca--', 'tid' => ''];
        foreach ($brand_line as $k => $val) {
          $settings['brand_line'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $container_type = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'container_type'
      ]);
      if(!empty($container_type)){
        $settings['container_type'][] = ['name' => '--Tipo contenedor--', 'tid' => ''];
        foreach ($container_type as $k => $val) {
          $settings['container_type'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $incoterms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'incoterms'
      ]);
      if(!empty($incoterms)){
        $settings['incoterms'][] = ['name' => '--Incoterm--', 'tid' => ''];
        foreach ($incoterms as $k => $val) {
          $settings['incoterms'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $deliveries = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'delivery_region'
      ]);
      if(!empty($deliveries)){
        $settings['deliveries'][] = ['name' => '--Entrega--', 'tid' => ''];
        foreach ($deliveries as $k => $val) {
          $settings['deliveries'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $margin = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'margin'
      ]);
      if(!empty($margin)){
        $settings['margin'][] = ['name' => '--Margen--', 'tid' => ''];
        foreach ($margin as $k => $val) {
          $settings['margin'][] = [
            'tid' => $val->tid->value,
            'name' => $val->name->value,
          ];
        }
      }

      $taxes = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'taxes'
      ]);
      if(!empty($taxes)){
        foreach ($taxes as $k => $tax) {
          $settings['taxes'][] = [
            'rfq' => $tax->field_rfq->target_id,
            'region' => $tax->field_origin->target_id,
            'tax' => $tax->field_tax->value,
          ];
        }
      }

      $providerList = \Drupal::entityTypeManager()->getStorage('node')->loadByProperties([
        'type' => 'provider',
        'status' => 1
      ]);
      foreach ($providerList as $key => $prov) {
        $settings['providers_list'][] = [
            'nid' => $prov->nid->value,
            'title' => $prov->title->value,
            'mail' => $prov->field_email->value
        ];
      }

      $taxs = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'trm_a_usd'
      ]);
      if(!empty($taxs)){
        $settings['currencies'][] = ['name' => '--Moneda--', 'tid' => ''];
        foreach ($taxs as $key => $tax) {
          $settings['currencies'][] = [
            'name' => $tax->name->value,
            'tid' => $tax->tid->value,
            'factor' => $tax->field_factor->value
          ];
        }
      }
      if(!empty($node->nid->value) && count($node->get('field_trm_s')->getValue()) < 2){
        $node->set('field_trm_s', []);
        $node->save();
        $paramsCurrencies = [];
        foreach ($settings['currencies'] as $key => $value) {
          if(isset($value['factor'])){
            $parag = Paragraph::create([
              'type' => 'trm_parameters',
              'field_currency_param' => [ 'target_id' => $value['tid'] ],
              'field_trm_param' => $value['factor'],
            ]);
            if($parag->save()){
              $paramsCurrencies[] = [
                'target_id' => $parag->id(),
                'target_revision_id' => $parag->getRevisionId(),
              ];
            }
          }
        }
        $node->set('field_trm_s', $paramsCurrencies);
        $node->save();
      }
      foreach ($node->get('field_trm_s')->referencedEntities() as $key => $trm) {
        if(!empty($trm->field_currency_param->entity->name->value)){
          $settings['parameters'][] = [
            'name' => $trm->field_currency_param->entity->name->value,
            'tid' => $trm->field_currency_param->target_id,
            'factor' => $trm->field_trm_param->value
          ];
        }
      }

      $shipping_cost_origin = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'shipping_cost_origin'
      ]);
      if(!empty($shipping_cost_origin)){
        foreach ($shipping_cost_origin as $k => $term) {
          $settings['shipping'][] = [
            'name' => $term->name->value,
            'shipping_method' => $term->field_shipping_method->target_id,
            'origin' => $term->field_origin->target_id,
            'dimension' => $term->field_dimension->target_id,
            'cost' => $term->field_cost->value,
            'customs' => $term->field_customs->value,
            'type_delivery' => $term->field_shipping_method->entity->field_type_delivery->value ?? null
          ];
        }
      }

      $container_delivery = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'container_delivery'
      ]);
      if(!empty($container_delivery)){
        $settings['container_delivery'] = ['--Contenedor Entrega--'];
        foreach ($container_delivery as $k => $term) {
          $settings['container_delivery'][] = [
            'name' => $term->name->value,
            'shipping_method' => $term->field_customs->value,
            'tid' => $term->tid->value
          ];
        }
      }
      return $settings;
    }

}
