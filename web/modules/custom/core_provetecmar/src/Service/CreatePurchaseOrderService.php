<?php

namespace Drupal\core_provetecmar\Service;

use Drupal\node\Entity\Node;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Service for create purchase order for provider
 */
class CreatePurchaseOrderService {


  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface;
   */
  protected $entityTypeManager;

  /**
   * Constructor.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager) {
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * Create purchase order
   * @param Node $node
   *  Node from quote
   * @return array
   */
  function createPurchase(Node $node) : array {
    $result = ['success' => FALSE];
    $purchaseSearch = $this->entityTypeManager->getStorage('node')->loadByProperties([
                        'type' => 'purchase_order',
                        'field_quote' => $node->nid->value,
                      ]);
    if(!empty($purchaseSearch)){
      return ['success' => FALSE, 'msg' => "Ya se ha generado las órdenes de compra de ésta cotización"];
    }
    $providersGroup = $this->getProvider($node->get('field_products')->referencedEntities());
    foreach ($providersGroup as $key => $group) {
      $nodePurchase = Node::create([
        'type' => 'purchase_order',
        'field_quoter' => $node->field_quoter->target_id,
        'field_description' => $node->field_description->target_id,
        'field_provider' => $key,
        'field_quote' => $node->nid->value,
        'title' => 'Orden de compra de '.$node->title->value,
        'field_incoterms' => $node->field_incoterms->target_id
      ]);
      $new_paragraphs = [];
      foreach ($group['paragraphs'] as $key => $paragraph) {
        $new_paragraph = Paragraph::create([
          'type' => $paragraph->bundle(),
        ]);
        $new_paragraph->set('field_cant', $paragraph->get('field_cant')->value);
        $new_paragraph->set('field_comments', $paragraph->get('field_comments')->value);
        $new_paragraph->set('field_total_cost', $paragraph->get('field_total_cost')->value);
        $new_paragraph->set('field_cost', $paragraph->get('field_cost')->value);
        $new_paragraph->set('field_company', $paragraph->get('field_company')->target_id);
        $new_paragraph->set('field_container_delivery', $paragraph->get('field_container_delivery')->target_id);
        $new_paragraph->set('field_sale_factor', $paragraph->get('field_sale_factor')->value);
        $new_paragraph->set('field_landed_cost', $paragraph->get('field_landed_cost')->value);
        $new_paragraph->set('field_assessment', $paragraph->get('field_assessment')->target_id);
        $new_paragraph->set('field_tax', $paragraph->get('field_tax')->value);
        $new_paragraph->set('field_incoterm', $paragraph->get('field_incoterm')->target_id);
        $new_paragraph->set('field_margin', $paragraph->get('field_margin')->target_id);
        $new_paragraph->set('field_weight_total', $paragraph->get('field_weight_total')->value);
        $new_paragraph->set('field_product', $paragraph->get('field_product')->target_id);
        $new_paragraph->set('field_qty', $paragraph->get('field_qty')->value);
        $new_paragraph->set('field_delivery_region', $paragraph->get('field_delivery_region')->target_id);
        $new_paragraph->set('field_check', $paragraph->get('field_check')->value);
        $new_paragraph->set('field_delivery_time', $paragraph->get('field_delivery_time')->value);
        $new_paragraph->set('field_container_type', $paragraph->get('field_container_type')->target_id);
        $new_paragraph->set('field_shipping_method', $paragraph->get('field_shipping_method')->target_id);
        $new_paragraph->set('field_currency_line', $paragraph->get('field_currency_line')->target_id);
        $new_paragraph->set('field_brand', $paragraph->get('field_brand')->target_id);
        $new_paragraph->set('field_delivery_time_client', $paragraph->get('field_delivery_time_client')->target_id);
        $new_paragraph->set('field_total', $paragraph->get('field_total')->value);
        $new_paragraph->set('field_total_sale', $paragraph->get('field_total_sale')->value);
        $new_paragraph->set('field_unit_sale', $paragraph->get('field_unit_sale')->value);
        $new_paragraph->save();
        $new_paragraphs[] = ['target_id' => $new_paragraph->id(), 'target_revision_id' => $new_paragraph->getRevisionId()];
      }
      $nodePurchase->set('field_products',$new_paragraphs);
      $trms_paragraph = [];
      foreach ($node->get('field_trm_s')->referencedEntities() as $k => $trms) {
        $new_paragraph = Paragraph::create([
          'type' => $trms->bundle(),
        ]);
        $new_paragraph->set('field_currency_param', $trms->get('field_currency_param')->target_id);
        $new_paragraph->set('field_trm_param', $trms->get('field_trm_param')->value);
        $new_paragraph->save();
        $trms_paragraph[] = ['target_id' => $new_paragraph->id(), 'target_revision_id' => $new_paragraph->getRevisionId()];
      }
      $nodePurchase->set('field_trm_s',$trms_paragraph);
      if($nodePurchase->save()){
        $result = ['success' => TRUE, 'msg' => 'Las órdenes de compra se han generado con éxito'];
      }
    }
    return $result;
  }

  /**
   * Get providers
   * @param Paragraph $paragraphs
   * @return Array $providers
   */
  function getProvider($paragraphs) : array {
    $result = [];
    foreach ($paragraphs as $k => $paragraph) {
      $provider = $paragraph->field_product->entity->field_provider->entity;
      if(!$provider){
        continue;
      }
      $result[$provider->nid->value]['provider'] = $provider;
      $result[$provider->nid->value]['paragraphs'][] = $paragraph;
    }
    return $result;
  }

}
