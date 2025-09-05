<?php

namespace Drupal\core_provetecmar\Service;

use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Servicio para enviar correos usando la configuración de correo del core.
 */
class MailerProv {

  /**
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Constructor.
   */
  public function __construct(MailManagerInterface $mail_manager, LanguageManagerInterface $language_manager) {
    $this->mailManager = $mail_manager;
    $this->languageManager = $language_manager;
  }

  /**
   * Envía un correo.
   *
   * @param string $to
   *   Dirección del destinatario.
   * @param string $subject
   *   Asunto del correo.
   * @param string $body
   *   Cuerpo del correo (texto plano o HTML).
   * @param bool $html
   *   TRUE para enviar en formato HTML, FALSE para texto plano.
   * @param array $params
   *   Parámetros adicionales (por ejemplo: variables dinámicas).
   *
   * @return array
   *   Resultado del envío.
   */
  public function sendMail(string $to, string $subject, string $body, $attachments = []) {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $params = [
      'subject' => $subject,
      'body' => $body,
      'headers' => [
        'Content-Type' => 'text/html; charset=UTF-8',
      ],
    ];
    if(!empty($attachments)){
      $params['attachments'] = [$attachments];
    }
    return $this->mailManager->mail('core_provetecmar', 'custom_mail', $to, $langcode, $params, NULL, TRUE);
  }

}
