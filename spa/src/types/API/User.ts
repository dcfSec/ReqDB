import { BaseItem } from "./Base";

export interface Item extends BaseItem {
  email: string;
  created: number;
  notificationMailOnCommentChain: boolean;
  notificationMailOnRequirementComment: boolean;
  atlassianCloudActive: boolean;
}