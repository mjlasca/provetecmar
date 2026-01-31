<?php

namespace Drupal\core_provetecmar\Service;

use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Service for create purchase order for provider
 */
class GetPathFilesService {
  /**
   * @var \Drupal\Core\File\FileSystemInterface;
   */
  protected $file_system;

  /**
   * Constructor.
   */
  public function __construct(
    FileSystemInterface $file_system
  ) {
    $this->file_system = $file_system;
  }

  /**
   * Function for get filepath from file entity
   * @param NodeInterface $node
   * @param string $field_name
   * @return array
   */
  function getPathFiles($node, $field_name) : array {
    $attachments = [];
    if (!$node->get($field_name)->isEmpty()) {
      foreach ($node->get($field_name) as $item) {
        $file = File::load($item->target_id);
        if ($file) {
          $uri = $file->getFileUri();
          $filepath = $this->file_system->realpath($uri);
          $attachments[] = [
            'filepath' => $filepath,
            'filename' => $file->getFilename(),
            'filemime' => $file->getMimeType(),
          ];
        }
      }
    }
    return $attachments;
  }

}
