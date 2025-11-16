export interface IssueType {
  id: string;
  name: string;
  iconUrl: string;
  subtask: boolean;
}

export interface Projects {
  [key: string]: string;
}

export interface Configuration {
  enabled: boolean;
  tenant: string;
  user: string;
}

export interface Token {
  access_token: string;
  expires_at: number;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  avatarUrls: {
    [key: string]: string;
  };
}

export interface JiraPaginatedResponse {
  self: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: Array<unknown>;
}

export interface JiraField {
  fieldId: string;
  autoCompleteUrl?: string;
  hasDefaultValue: boolean;
  defaultValue?: string
  allowedValues?: object[]
  key: string;
  name: string;
  operations: string[];
  required: boolean;
  schema: {
    type: string;
    items?: string;
  }
}

export interface JiraFieldsPaginated {
  fields: JiraField[];
  maxResults: number;
  startAt: number;
  total: number;
}

export interface User {
  accountId: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
  avatarUrls: {
    [key: string]: string;
  };
}

export interface Issue {
  id: string;
  key: string;
  keyHtml: string;
  img: string;
  summary: string;
  summaryText: string;
}

export interface Priority {
  iconUrl: string;
  id: string;
  name: string;
}

export interface Team {
  value: string;
  displayName: string;
}

export interface Option {
  id: string;
  value?: string;
  name?: string;
}

export interface Label {
  value: string;
  displayName: string;
}