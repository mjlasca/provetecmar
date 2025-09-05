<?php

namespace Drupal\core_provetecmar\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Defines the mail_log entity.
 *
 * @ingroup mail_log
 *
 * @ContentEntityType(
 *   id = "mail_log",
 *   label = @Translation("Mail Requests"),
 *   base_table = "mail_log",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *   },
 * )
 */

class MailLog extends ContentEntityBase implements ContentEntityInterface {

  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {

    $fields['id'] = BaseFieldDefinition::create('integer')
      ->setLabel(t('ID'))
      ->setReadOnly(TRUE);

    $fields['uuid'] = BaseFieldDefinition::create('uuid')
      ->setLabel(t('UUID'))
      ->setReadOnly(TRUE);

    $fields['to'] = BaseFieldDefinition::create('string')
      ->setLabel(t('To'))
      ->setRequired(TRUE)
      ->setSettings(['max_length' => 255]);

    $fields['subject'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Subject'))
      ->setSettings(['max_length' => 255]);

    $fields['body'] = BaseFieldDefinition::create('string_long')
      ->setLabel(t('Body'));

    $fields['status'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Status'))
      ->setDefaultValue(FALSE);

    $fields['provider'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Provider'))
      ->setSetting('target_type', 'node') // tu tipo de contenido provider
      ->setDisplayOptions('view', ['label' => 'hidden', 'type' => 'entity_reference_label', 'weight' => 0])
      ->setDisplayOptions('form', ['type' => 'entity_reference_autocomplete', 'weight' => 0]);

    $fields['uid'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('User'))
      ->setSetting('target_type', 'user')
      ->setDefaultValueCallback('Drupal\node\Entity\Node::getCurrentUserId');

    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'));

    return $fields;
  }
}
