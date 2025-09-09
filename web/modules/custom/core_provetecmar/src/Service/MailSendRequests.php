<?php
namespace Drupal\core_provetecmar\Service;

use Drupal\core_provetecmar\Service\MailerProv;
use Drupal\node\Entity\Node;
use Dompdf\Dompdf;
use Dompdf\Options;
use Drupal\core_provetecmar\Entity\MailLog;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\File\FileSystemInterface;

class MailSendRequests {

  /**
   * Drupal\Core\Render\RendererInterface;
   */
  protected $renderer;
  /**
   * Drupal\core_provetecmar\Service\MailerProv
   */
  protected $mailer;
  /**
   * Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;
  /**
   * Drupal\Core\File\FileSystemInterface;
   */
  protected $fileSystem;

  /**
   * @param Drupal\core_provetecmar\Service\MailerProv
   *  Class manage send email
   * @param Drupal\Core\Render\RendererInterface
   *  Renderet html for email and PDF
   * @param Drupal\Core\Session\AccountProxyInterface
   *  Current user drupal
   */
  public function __construct(
    MailerProv $mailer,
    RendererInterface $renderer,
    AccountProxyInterface $current_user,
    FileSystemInterface $file_system
    ) {
    $this->mailer = $mailer;
    $this->renderer = $renderer;
    $this->currentUser = $current_user;
    $this->fileSystem = $file_system;
  }

  /**
   * Function for procces node and send requests quote to providers
   * @param Node
   *  Nodo quote white paragraphs line products
   */
  public function proccess(Node $node) : bool {
    $paragraphs =  $node->field_products->referencedEntities();
    $lineProducts = [];
    foreach ($paragraphs as $key => $paragraph) {
      if($paragraph->field_check->value == 1){
        if( !empty($paragraph->field_product->target_id) && !empty($paragraph->field_product->entity->field_provider->target_id) ) {
          $lineProducts[$paragraph->field_product->entity->field_provider->target_id]['provider'] = $paragraph->field_product->entity->field_provider->entity;
          $lineProducts[$paragraph->field_product->entity->field_provider->target_id]['items'][] = $paragraph;
        }
      }
    }
    foreach ($lineProducts as $key => $prov) {
      $to = $prov['provider']->field_email->value;
      $data['provider'] = $prov['provider']->title->value;
      $data['date'] = $prov['provider'];
      $build = [
        '#theme' => 'rfq_mail',
        '#company_name' => 'Provetecmar S.A.',
        '#rfq_number' => "RFQ-{$node->nid->value}",
        '#data' => $data,
        '#items' => $prov['items'],
      ];
      
      $html = $this->renderer->renderPlain($build);

      $build = [
        '#theme' => 'rfq_pdf_mail',
        '#company_name' => 'Provetecmar S.A.',
        '#rfq_number' => "RFQ-{$node->nid->value}",
        '#data' => $data,
        '#items' => $prov['items'],
      ];

      $htmlPdf = $this->renderer->renderPlain($build);

      $options = new Options();
      $options->set('isRemoteEnabled', TRUE);
      $dompdf = new Dompdf($options);
      $dompdf->loadHtml($htmlPdf);
      $dompdf->setPaper('A4', 'portrait');
      $dompdf->render();
      $pdfContent = $dompdf->output();

      $pdfPath = 'public://rfq-' . $node->nid->value . '.pdf';
      file_put_contents($this->fileSystem->realpath($pdfPath), $pdfContent);
      $attach = [
        'filepath' => $pdfPath,
        'filename' => 'RFQ-' . $node->nid->value . '.pdf',
        'filemime' => 'application/pdf',
      ];
      if($this->mailer->sendMail($to, "Solicitud de cotización RFQ-{$node->nid->value}", $html, $attach)){
         $node = Node::create([
            'type'        => 'requests',              // Machine name del tipo de contenido.
            'title'       => 'Envío '.$node->nid->value.$node->created->value,
            'uid'         => $this->currentUser->id(),                      // ID del autor (1 = admin).
            'status'      => 1,                      // 1 = publicado, 0 = no publicado.
            'field_html'        => [
              'value' => $htmlPdf,
              'format' => 'full_html',
            ],
            'field_provider' => [
              'target_id' => $prov['provider']->id()
            ]

            
          ]);

          // Guardar el nodo.
          $node->save();
      /*  $mailLog = MailLog::create([
                  'to' => $to,
                  'subject' => "Solicitud de cotización RFQ-{$node->nid->value}",
                  'body' => $html,
                  'status' => 'sent',
                  'rfq' => $node->id(),
                  'provider' => $prov['provider']->id(),
                  'uid' => $this->currentUser->id(),
                ]);
        $mailLog->save();*/
      }else{

      }
    }
    return true;
  }
}
