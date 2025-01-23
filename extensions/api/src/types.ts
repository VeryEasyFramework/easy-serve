import { EasyFieldType } from "../../../../easy-orm/src/ormTypes/easyField.ts";
import type { EasyRequest, EasyResponse, EasyServer } from "../../../mod.ts";
import type { HandlerResponse } from "#/extension/pathHandler.ts";

export interface EasyAPIDocs extends Record<string, unknown> {
  groups: EasyAPIGroupDocs[];
}

export interface EasyAPIGroupDocs {
  groupName: string;
  description: string;
  actions: EasyAPIActionDocs[];
}
export interface DocsActionParam {
  paramName: string;
  required: boolean;
  type: EasyFieldType;
}
export interface EasyAPIActionDocs {
  actionName: string;
  description: string;
  params?: Array<DocsActionParam>;
}
export interface EasyAPIGroup {
  groupName: string;
  description: string;
  actions: Map<string, EasyAPIAction>;
}
export interface EasyAPIAction {
  actionName: string;
  description: string;
  params: Record<string, {
    type: EasyFieldType;
    required?: boolean;
  }>;
  handler: (
    data: Map<string, unknown>,
    server: EasyServer,
    easyRequest: EasyRequest,
    easyResponse: EasyResponse,
  ) => Promise<HandlerResponse> | HandlerResponse;
}
