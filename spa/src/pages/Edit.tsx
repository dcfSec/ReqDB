import { Item as Catalogue } from '../types/API/Catalogues';
import { Item as Extra } from '../types/API/Extras';
import { Type } from '../types/API/Extras';
import { Item as Requirement } from "../types/API/Requirements";
import { Item as Tag } from "../types/API/Tags";
import { Item as Topic } from "../types/API/Topics";
import { EditParent } from "../components/Edit/Parent";


/**
 * View for editing Tags
 * 
 * @returns Tags view for editing
 */
export function Tags() {
  return <EditParent editPageName="Tags" humanKey="name"
    headers={[
      "#",
      "Name",
      "Requirements",
      "Catalogues",
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
  return <EditParent editPageName="Catalogues" humanKey="title"
    headers={[
      "#",
      "Key",
      "Title",
      "Description",
      "Root Elements",
      "Tags",
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
  return <EditParent editPageName="Topics" humanKey="key"
    headers={[
      "#",
      "Key",
      "Title",
      "Description",
      "Parent",
      "Children",
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
  return <EditParent editPageName="Requirements" humanKey="key"
    headers={[
      "#",
      "Key",
      "Title",
      "Description",
      "Parent",
      "Tags",
      "Extras",
      "Visible",
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
  return <EditParent editPageName="ExtraTypes" humanKey="title"
    headers={[
      "#",
      "Title",
      "Description",
      "Type",
      "Children",
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
  return <EditParent editPageName="ExtraEntries" humanKey="id"
    headers={[
      "#",
      "Content",
      "ExtraType",
      "Requirement",
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
