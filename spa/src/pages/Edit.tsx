import { Item as Catalogue } from '../types/API/Catalogues';
import { Item as Extra } from '../types/API/Extras';
import { Type } from '../types/API/Extras';
import { Item as Requirement } from "../types/API/Requirements";
import { Item as Tag } from "../types/API/Tags";
import { Item as Topic } from "../types/API/Topics";
import { EditParent } from "../components/Edit/Parent";
import { useTranslation } from 'react-i18next';


/**
 * View for editing Tags
 * 
 * @returns Tags view for editing
 */
export function Tags() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.tags.name" humanKey="name"
    headers={[
      "#",
      t('edit.tags.headers.name'),
      t('edit.tags.headers.requirements'),
      t('edit.tags.headers.catalogues'),
    ]}
    blankItem={{
      name: "",
    } as Tag}
    searchFields={[
      "name"
    ]}
    endpoint="tags"
    needCascade={false}
    parameters={["expandTopics=true"]}
  />
}

/**
 * View for editing Catalogues
 * 
 * @returns Catalogues view for editing
 */
export function Catalogues() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.catalogues.name" humanKey="title"
    headers={[
      "#",
      t('edit.catalogues.headers.key'),
      t('edit.catalogues.headers.title'),
      t('edit.catalogues.headers.description'),
      t('edit.catalogues.headers.root'),
      t('edit.catalogues.headers.tags'),
    ]}
    blankItem={{
      title: "",
      description: "",
    } as Catalogue}
    searchFields={[
      "title",
      "description"
    ]}
    endpoint="catalogues"
    needCascade={false}
    parameters={["expandTopics=true"]}
  />
}

/**
 * View for editing Topics
 * 
 * @returns Topics view for editing
 */
export function Topics() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.topics.name" humanKey="key"
    headers={[
      "#",
      t('edit.topics.headers.key'),
      t('edit.topics.headers.title'),
      t('edit.topics.headers.description'),
      t('edit.topics.headers.parent'),
      t('edit.topics.headers.children'),
    ]}
    blankItem={{
      key: "",
      title: "",
      description: "",
      parentId: null,
    } as unknown as Topic}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="topics"
    needCascade={true}
    parameters={[]}
  />
}

/**
 * View for editing Requirements
 * 
 * @returns Requirements view for editing
 */
export function Requirements() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.requirements.name" humanKey="key"
    headers={[
      "#",
      t('edit.requirements.headers.key'),
      t('edit.requirements.headers.title'),
      t('edit.requirements.headers.description'),
      t('edit.requirements.headers.parent'),
      t('edit.requirements.headers.tags'),
      t('edit.requirements.headers.extras'),
      t('edit.requirements.headers.visible'),
    ]}
    blankItem={{
      key: "",
      title: "",
      description: "",
      parentId: null,
      visible: true,
    } as unknown as Requirement}
    searchFields={[
      "key", "title", "description"
    ]}
    endpoint="requirements"
    needCascade={false}
    parameters={[]}
  />
}

/**
 * View for editing ExtraTypes
 * 
 * @returns ExtraTypes view for editing
 */
export function ExtraTypes() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.extraTypes.name" humanKey="title"
    headers={[
      "#",
      t('edit.extraTypes.headers.title'),
      t('edit.extraTypes.headers.description'),
      t('edit.extraTypes.headers.type'),
      t('edit.extraTypes.headers.children'),
    ]}
    blankItem={{
      title: "",
      description: "",
      extraType: null
    } as unknown as Type}
    searchFields={[
      "title", "description"
    ]}
    endpoint="extraTypes"
    needCascade={false}
    parameters={[]}
  />
}

/**
 * View for editing ExtraEntries
 * 
 * @returns ExtraEntries view for editing
 */
export function ExtraEntries() {
  const { t } = useTranslation();
  return <EditParent editPageName="edit.extraEntries.name" humanKey="id"
    headers={[
      "#",
      t('edit.extraEntries.headers.content'),
      t('edit.extraEntries.headers.extraType'),
      t('edit.extraEntries.headers.requirement'),
    ]}
    blankItem={{
      content: "",
      extraType: "",
      requirementId: null,
      parent: null,
    } as unknown as Extra}
    searchFields={[
      "content",
      "extraType.title",
      "requirement.key"
    ]}
    endpoint="extraEntries"
    needCascade={false}
    parameters={[]}
  />
}
