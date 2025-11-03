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

/**
 * Controller for feature quote's
 */
class PurchaseOrderController extends ControllerBase implements ContainerInjectionInterface {

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


  public function __construct(
    MailerProv $mailer,
    LanguageManagerInterface $language_manager,
    EntityTypeManagerInterface $entityTypeManager,
    RendererInterface $renderer,
    FileSystemInterface $file_system,
    MessengerInterface $messenger
    ) {
    $this->mailer = $mailer;
    $this->languageManager = $language_manager;
    $this->entityTypeManager = $entityTypeManager;
    $this->renderer = $renderer;
    $this->fileSystem = $file_system;
    $this->messenger = $messenger;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('core_provetecmar.mailer'),
      $container->get('language_manager'),
      $container->get('entity_type.manager'),
      $container->get('renderer'),
      $container->get('file_system'),
      $container->get('messenger')
      
    );
  }

  /**
   * Download PDF
   * @param int $nid
   *  Id node
   * @return JsonResponse
   */
  public function download($nid, $return = 'pdf') : Response {
    $node = $this->entityTypeManager->getStorage('node')->load($nid);

    if(!empty($node->created->value)){
      $dt = new DrupalDateTime("@".$node->created->value);
      $date = $dt->format("d \\d\\e F \\d\\e\\l Y");
    }

    $paragraphs =  $node->field_products->referencedEntities();
    $items = [];
    $total = 0;
    foreach ($paragraphs as $k => $paragraph) {
      if($paragraph->field_check->value == 1){
        $items[] = [
          'title' => $paragraph->field_product->entity->title->value,
          'part' => $paragraph->field_product->entity->field_part->value,
          'description' => $paragraph->field_product->entity->field_description->value,
          'cant' => $paragraph->field_cant->value,
          'unit' => $paragraph->field_product->entity->field_unit->entity->name->value,
          'price' => $paragraph->field_cost->value,
          'price_total' => $paragraph->field_total_cost->value
        ];
        if(!empty( $paragraph->field_total_cost->value )){
          $total +=  $paragraph->field_total_cost->value;
        }
      }
    }
    $base_path = \Drupal::service('extension.list.module')->getPath('core_provetecmar');
    $base64Logo = 'data:image/jpeg;base64,' . base64_encode(file_get_contents("$base_path/assets/banner-provetecmar.jpg"));

    $build = [
      '#theme' => 'purchase_order_pdf',
      '#data' => [
        'nid' => $node->nid->value,
        'date' => $date,
        'client' => [
          'name' => $node->field_provider->entity->title->value,
          'phone' => $node->field_provider->entity->field_phone->value,
          'email' => $node->field_provider->entity->field_email->value,
        ],
        'node' => [
          //'trm' => $node->field_trm->value,
          'incoterm' => $node->field_incoterms->entity->name->value
        ],
        'items' => $items,
        'subtotal' => $total,
        'base64Logo' => $base64Logo,
      ],
    ];
    $htmlPdf = $this->renderer->renderPlain($build);

    $options = new Options();
    $options->set('isRemoteEnabled', TRUE);

    $dompdf = new Dompdf($options);
    $dompdf->loadHtml($htmlPdf);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    $pdfContent = $dompdf->output();

    
    if($return == 'mail'){
      $pdfPath = 'public://Orden-de-compra-' . $node->nid->value . '.pdf';
      file_put_contents($this->fileSystem->realpath($pdfPath), $pdfContent);
      $attach = [
        'filepath' => $pdfPath,
        'filename' => 'Orden de compra-' . $node->nid->value . '.pdf',
        'filemime' => 'application/pdf',
      ];
      $to = $node->field_provider->entity->field_email->value;

      if($this->mailer->sendMail($to, "Orden de compra-{$node->nid->value}", $htmlPdf, $attach)){
        $response = new RedirectResponse("/node/{$node->nid->value}");
         $this->messenger->addMessage("Se ha enviado PDF de Orden de Compra correctamente a {$to}");
        $response->send();
      }
        
    }else{
      $response = new Response($pdfContent);
      $response->headers->set('Content-Type', 'application/pdf');
      $response->headers->set('Content-Disposition', 'inline; filename="archivo.pdf"');
    }

    return $response;
  }

}
