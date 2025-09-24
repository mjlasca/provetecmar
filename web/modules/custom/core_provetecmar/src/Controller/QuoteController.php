<?php

namespace Drupal\core_provetecmar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\core_provetecmar\Service\MailerProv;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller for feature quote's
 */
class QuoteController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * @var \Drupal\core_provetecmar\Service\MailerProv
   */
  protected $mailerProv;

  /**
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface;
   */
  protected $entityTypeManager;


  public function __construct(MailerProv $mailer, LanguageManagerInterface $language_manager, EntityTypeManagerInterface $entityTypeManager,) {
    $this->mailerProv = $mailer;
    $this->languageManager = $language_manager;
    $this->entityTypeManager = $entityTypeManager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('core_provetecmar.mailer'),
      $container->get('language_manager'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * Send mail requests
   * @param array $items
   * @return array $results
   */
  public function sendMailRequests($items) : array {
    $result = ['success' => false];
    foreach ($items as $key => $item) {
      
    }
    if($this->mailerProv->sendMail(
      'mjlasca@gmail.com',
      'Saludo desde controller',
      '<div><h1>Hola si</h1></div>',
    )){
    }
    return $result;
  }

  /**
   * Get product
   * @param int $nid
   *  Id node
   * @return JsonResponse
   */
  public function getProduct($nid) : JsonResponse {
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    $result = [];
    if(!empty($node)){
      $result['weight'] = $node->field_unit_weight->value ?? 0;
      $result['cost_unit'] = $node->field_unit_cost->value ?? 0;
      $result['provider'] = $node->field_provider->target_id ?? 0;
    }
    if(!empty($result))
      return new JsonResponse(['success' => TRUE, 'product' => $result], 200);
    return new JsonResponse(['success' => 'invalid request method'], 400);
  }

}
