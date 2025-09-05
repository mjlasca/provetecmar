<?php

namespace Drupal\core_provetecmar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\core_provetecmar\Service\MailerProv;
use Symfony\Component\DependencyInjection\ContainerInterface;

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

  public function __construct(MailerProv $mailer, LanguageManagerInterface $language_manager) {
    $this->mailerProv = $mailer;
    $this->languageManager = $language_manager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('core_provetecmar.mailer'),
      $container->get('language_manager')
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


}
