<?php

namespace Drupal\core_provetecmar\Service;

use Drupal\node\Entity\Node;

/**
 * Service for create purchase order service
 */
class CreatePurchaseOrderService {

  /**
   * Constructor.
   */
  public function __construct() {
    
  }

  /**
   * Create purchase order
   * @param Node $node
   *  Node from quote
   * @return bool
   */
  function createPurchase(Node $node) : bool {
    $result = false;
    $providers = $this->getProvider($node->get('field_products')->referencedEntities());
    dd($providers);
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
      $result[] = [
        'nid' => $paragraph->field_product->entity->field_provider->entity->nid->value,
        'name' => $paragraph->field_product->entity->field_provider->entity->title->value,
      ];
    }
    return $result;
  }

}
