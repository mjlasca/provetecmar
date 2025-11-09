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
class DashboardController extends ControllerBase implements ContainerInjectionInterface {

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
   * Show twig dashboard
   *  Id node
   * @return Array
   */
  public function build() : array {
    $request = \Drupal::request();
    $arr = \Drupal::request()->query->all();
    $min = $arr['created']['min'] ?? NULL;
    $max = $arr['created']['max'] ?? NULL;
    $date['datemin'] = $min;
    $date['datemax'] = $max;
    
    return [
      '#theme' => 'dashboard',
      '#data' => $date,
    ];
  }

}
