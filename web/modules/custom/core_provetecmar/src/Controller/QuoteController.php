<?php

namespace Drupal\core_provetecmar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\core_provetecmar\Service\MailerProv;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Render\RendererInterface;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\File\FileSystemInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\core_provetecmar\Service\CreatePurchaseOrderService;
use Drupal\core_provetecmar\Service\MailSendRequests;
use Drupal\core_provetecmar\Service\SetLinesQuoteService;
use Symfony\Component\HttpFoundation\Request;
use Drupal\core_provetecmar\Service\SendQouteClient;


/**
 * Controller for feature quote's
 */
class QuoteController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Drupal\Core\Render\RendererInterface;
   */
  protected $renderer;

  /**
   * @var \Drupal\core_provetecmar\Service\MailerProv
   */
  protected $mailer;

  /**
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface;
   */
  protected $entityTypeManager;
  /**
   * Drupal\Core\File\FileSystemInterface;
   */
  protected $fileSystem;
  /**
   * El servicio Messenger.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * Service createPurchase
   *
   * @var \Drupal\core_provetecmar\Service\CreatePurchaseOrderService
   */
  protected $createPurchaseService;

  /**
   * Service send requests
   *
   * @var \Drupal\core_provetecmar\Service\MailSendRequests;
   */
  protected $mailSendRequests;

  /**
   * Set lines for save paragraph
   * @var \Drupal\core_provetecmar\Service\SetLinesQuoteService
   */
  protected $setLine;

  /**
   * Service send qoute client
   * @var \Drupal\core_provetecmar\Service\SendQouteClient
   */
  protected $sendQouteClient;


  public function __construct(
    MailerProv $mailer,
    LanguageManagerInterface $language_manager,
    EntityTypeManagerInterface $entityTypeManager,
    RendererInterface $renderer,
    FileSystemInterface $file_system,
    MessengerInterface $messenger,
    CreatePurchaseOrderService $createPurchaseService,
    MailSendRequests $mailSendRequests,
    SetLinesQuoteService $setLinesQuote,
    SendQouteClient $sendQouteClient
    ) {
    $this->mailer = $mailer;
    $this->languageManager = $language_manager;
    $this->entityTypeManager = $entityTypeManager;
    $this->renderer = $renderer;
    $this->fileSystem = $file_system;
    $this->messenger = $messenger;
    $this->createPurchaseService = $createPurchaseService;
    $this->mailSendRequests = $mailSendRequests;
    $this->setLine = $setLinesQuote;
    $this->sendQouteClient = $sendQouteClient;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('core_provetecmar.mailer'),
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('renderer'),
      $container->get('file_system'),
      $container->get('messenger'),
      $container->get('core_provetecmar.quote_create_purchase'),
      $container->get('core_provetecmar.mailsendrequest'),
      $container->get('core_provetecmar.save_lines_quote'),
      $container->get('core_provetecmar.send_qoute_client'),
    );
  }

  /**
   * Get Parameters quote
   * @return JsonResponse
   */
  public function getParametersQuote() : JsonResponse {
    $result = [];
    $taxes = $this->entityTypeManager->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'taxes'
    ]);
    if(!empty($taxes)){
      foreach ($taxes as $k => $tax) {
        $result['taxes'][] = [
          'rfq' => $tax->field_rfq->target_id,
          'region' => $tax->field_origin->target_id,
          'tax' => $tax->field_tax->value,
        ];
      }
    }
    return new JsonResponse(['success' => true, 'data' => $result], 200);
  }

  /**
   * Get product
   * @param int $nid
   *  Id node
   * @return JsonResponse / RedirectResponse;
   */
  public function getProduct($keyword) : mixed {
    $query = $this->entityTypeManager
      ->getStorage('node')
      ->getQuery()
      ->condition('title', '%' . $keyword . '%', 'LIKE')
      ->condition('type', 'product')
      ->accessCheck(TRUE);

    $nids = $query->execute();

    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);
    if(empty($nodes))
      return new JsonResponse(['success' => TRUE, 'products' => []], 200);
    $result = [];
    foreach ($nodes as $key => $node) {
      if(!empty($node)){
        $result[] = [
          'nid' => $node->nid->value ?? 0,
          'name' => $node->title->value ?? 0,
          'weight' => $node->field_unit_weight->value ?? 0,
          'cost_unit' => $node->field_unit_cost->value ?? 0,
          'provider' => $node->field_provider->target_id ?? 0,
          'currency' => $node->field_purchase_currency->target_id ?? 0,
        ];
      }
    }
    if(!empty($result))
      return new JsonResponse(['success' => TRUE, 'products' => $result], 200);
    return new JsonResponse(['success' => 'invalid request method'], 400);
  }

  /**
   * Download PDF
   * @param int $nid
   *  Id node
   * @return JsonResponse
   */
  public function download($nid, $return = 'pdf') : Response {
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    $response = $this->sendQouteClient->sendQouteClient($node, $return);
    return $response;
  }

  /**
   * Generate Purchase
   * @param int $nid
   *  Id node quote
   * @return RedirectResponse
   */
  function generatePurchase(int $nid) : RedirectResponse {
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    $response = new RedirectResponse("/node/{$node->nid->value}");
    $msg = 'No se ha podido crear las órdenes de compra';
    if(!empty($node)){
      $res = $this->createPurchaseService->createPurchase($node);
      $msg = $res['msg'];
      if($res['success']){
        $this->messenger->addMessage("Se han creado las órdenes de compra de la cotización");
        $response = new RedirectResponse("/node/{$node->nid->value}");
      }
      else{
        $this->messenger->addError($msg);
      }
    }
    $response->send();
    return $response;
  }

  /**
   * Send requests
   * @return Response
   */
  function sendRequests(Request $req) : JsonResponse {
    $data = json_decode($req->getContent(), TRUE);
    if(empty($data['providers']) || empty($data['products']) || empty($data['node']))
      return new JsonResponse(['msg' => 'Algunos de los datos esenciales está vacío'], 400);
    $res = $this->mailSendRequests->proccess($data);
    if($res['success'])
      return new JsonResponse(['success' => $res['success'], 'msg' => $res['msg']], 200);
    return new JsonResponse(['msg' => $res['msg']], 500);
  }

  /**
   * Send requests
   * @return Response
   */
  function saveLinesQuote($nid, Request $req) : JsonResponse {
    if(empty($nid))
      return new JsonResponse(['success' => FALSE], 400);
    $data['lines'] = json_decode($req->getContent(), TRUE);
    $data['node'] = $this->entityTypeManager->getStorage('node')->load($nid);
    $result = $this->setLine->saveLines($data);
    return new JsonResponse($result, 200);

  }
}
