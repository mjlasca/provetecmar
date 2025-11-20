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
use Drupal\taxonomy\Entity\Term;
use Psy\Readline\Hoa\Console;


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
   * @return Array
   *  Success and message status
   */
  public function proccess(array $productsProvider) : array {
    try {
      $lineProducts = [];
      $node = Node::load($productsProvider['node']);
      $companyData = [];
      foreach ($productsProvider['products'] as $k => $product) {
        $productNode = Node::load($product['nid']);
        $company = Term::load($product['company']);
        if(!empty($product)){
          $lineProducts[] = [
            'title' => $productNode->title->value,
            'description' => $productNode->field_description->value,
            'part_num' => strpos($productNode->field_part->value, 'SPN-') !== FALSE ? '' : $productNode->field_part->value ,
            'cant' => $product['cant'],
          ];
          if(empty($companyData)){
            $companyData['name'] = $company->name->value;
            $companyData['info'] = $company->field_data_company->value;
            $companyData['email'] = $company->field_email->value;
            $companyData['phone'] = $company->field_phone->value;
          }
        }
      }
      $result = array_map(function($item) use ($lineProducts) {
        $item['items'] = $lineProducts;
        return $item;
      }, $productsProvider['providers']);
      foreach ($result as $key => $prov) {
        $to = $prov['mail'];
        $data['provider'] = $prov['title'];
        $build = [
          '#theme' => 'rfq_mail',
          '#company_name' => 'Provetecmar S.A.',
          '#rfq_number' => "RFQ-{$node->nid->value}",
          '#data' => $data,
          '#items' => $prov['items'],
          '#company_data' => $companyData
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
          $nodeRequest = Node::create([
              'type'        => 'requests',
              'title'       => 'Envío '.$node->nid->value.$node->created->value,
              'uid'         => $this->currentUser->id(),
              'status'      => 1,
              'field_html'        => [
                'value' => $htmlPdf,
                'format' => 'full_html',
              ],
              'field_provider' => [
                'target_id' => $prov['nid']
              ],
              'field_quote' => [
                'target_id' => $node->nid->value
              ]
          ]);
          $nodeRequest->save();
        }
      }
      if(!empty($pdfPath))
        unlink($pdfPath);
      return ['success' => TRUE, 'msg' => 'Solicitudes enviadas con éxito'];
    } catch (\Throwable $th) {
      return ['success' => FALSE, 'msg' => "Hubo un error al enviar las solicitudes {$th->getMessage()}"];
    }

  }
}
