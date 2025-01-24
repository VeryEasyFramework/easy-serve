import type { HandlerResponse } from "#/extension/pathHandler.ts";
import type { EasyResponse } from "#/easyResponse.ts";
import type { EasyRequest } from "#/easyRequest.ts";
import type { EasyServe } from "../../../src/easyServe.ts";
import type { EasyFieldType } from "@vef/types";

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
    server: EasyServe,
    easyRequest: EasyRequest,
    easyResponse: EasyResponse,
  ) => Promise<HandlerResponse> | HandlerResponse;
}
