<?php

namespace Drupal\core_provetecmar\Service;

use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\core_provetecmar\Service\MailerProv;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Datetime\DrupalDateTime;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\core_provetecmar\Service\GetPathFilesService;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Service for create purchase order for provider
 */
class SendQouteClient {
  use StringTranslationTrait;

  /**
   * @var \Drupal\Core\File\FileSystemInterface;
   */
  protected $file_system;

  /**
   * @var \Drupal\Core\Render\RendererInterface;
   */
  protected $renderer;

  /**
   * @var \Drupal\Core\Messenger\MessengerInterface;
   */
  protected $messenger;

  /**
   * @var \Drupal\core_provetecmar\Service\MailerProv;
   */
  protected $mailer;

  /**
   * @var \Drupal\core_provetecmar\Service\GetPathFilesService;
   */
  protected $getPathFilesService;

  /**
   * Constructor.
   */
  public function __construct(
    RendererInterface $renderer,
    FileSystemInterface $file_system,
    MessengerInterface $messenger,
    MailerProv $mailer,
    GetPathFilesService $getPathFilesService,
    TranslationInterface $string_translation,
  ) {
    $this->renderer = $renderer;
    $this->file_system = $file_system;
    $this->messenger = $messenger;
    $this->mailer = $mailer;
    $this->getPathFilesService = $getPathFilesService;
    $this->stringTranslation = $string_translation;
  }

  /**
   * Function for send qoute client
   * @param NodeInterface $node
   * @return Response
   */
  function sendQouteClient($node, $return = 'pdf') : Response {
    if(!empty($node->created->value)){
      $dt = new DrupalDateTime("@".$node->created->value);
      $date = $dt->format("d \\d\\e F \\d\\e\\l Y");
    }
    $paragraphs =  $node->field_products->referencedEntities();
    $items = [];
    $total = 0;
    foreach ($paragraphs as $k => $paragraph) {
      $items[] = [
        'title' => $paragraph->field_product->entity->title->value,
        'part' => $paragraph->field_product->entity->field_part->value,
        'description' => $paragraph->field_product->entity->field_description->value,
        'cant' => $paragraph->field_cant->value,
        'unit' => $paragraph->field_product->entity->field_unit->entity->name->value,
        'price' => $paragraph->field_unit_sale->value,
        'price_total' => $paragraph->field_total_sale->value
      ];
      if(!empty( $paragraph->field_total_sale->value )){
        $total +=  $paragraph->field_total_sale->value;
      }
    }
    $base_path = \Drupal::service('extension.list.module')->getPath('core_provetecmar');
    $base64Logo = 'data:image/jpeg;base64,' . base64_encode(file_get_contents("$base_path/assets/banner-provetecmar.jpg"));
    if(!empty($node->field_rfq->target_id && !empty($node->field_rfq->entity->field_image->entity))){
      $urlImageSecond = $node->field_rfq->entity->field_image->entity->getFileUri();
      $base64Logo =  'data:image/jpeg;base64,' . base64_encode(file_get_contents($urlImageSecond));
    }
    $tax = $total * ( $node->field_quote_tax->value/100) ;
    $total_fu = $total + $tax;
    $arrTh = ["detail" => $this->t('Detalle', [], ['langcode' => $node->field_language->value])];
    $build = [
      '#theme' => 'quote_pdf',
      '#data' => [
        'nid' => $node->nid->value,
        'date' => $date,
        'client' => [
          'name' => $node->field_customer->entity->title->value,
          'phone' => $node->field_phone_client->value,
          'email' => $node->field_email_client->value,
          'currency' => $node->field_currency->entity->name->value
        ],
        'th' => $arrTh,
        'node' => [
          'valid' => $node->field_valid->value,
          'observation' => $node->field_observaciones->value,
          'tax' => $node->field_quote_tax->value,
          'trm' => $node->field_trm->value,
          'incoterm' => $node->field_incoterms->entity->name->value
        ],
        'items' => $items,
        'subtotal' => $total,
        'tax_total' => $tax,
        'total' => $total_fu,
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
      $pdfPath = 'public://cotización-' . $node->nid->value . '.pdf';
      file_put_contents($this->file_system->realpath($pdfPath), $pdfContent);
      $attach = [];
      if (in_array($node->get('moderation_state')->value, ['offer_ready', 'published'])) {
        $filesContact = $this->getPathFilesService->getPathFiles($node, 'field_client_files');
        if (!empty($filesContact)) {
          $attach = $filesContact;
        }
      }
      $attach[] = [
        'filepath' => $pdfPath,
        'filename' => 'Cotización-' . $node->id() . '.pdf',
        'filemime' => 'application/pdf',
      ];
      $to = $node->field_email_client->value;
      $subject = "Cotización-" . $node->id();
      if ($this->mailer->sendMail($to, $subject, $htmlPdf, $attach)) {
        $response = new RedirectResponse("/node/{$node->nid->value}");
         $this->messenger->addMessage("Se ha enviado PDF de cotización correctamente a {$to}");
      }
    }else{
      $response = new Response($pdfContent);
      $response->headers->set('Content-Type', 'application/pdf');
      $response->headers->set('Content-Disposition', 'inline; filename="archivo.pdf"');
    }
    return $response;
  }

}
