import type {
  EasyAPIAction,
  EasyAPIActionDocs,
  EasyAPIDocs,
  EasyAPIGroup,
  EasyAPIGroupDocs,
} from "#extensions/api/src/types.ts";

export class EasyAPI {
  actionGroups: Map<string, EasyAPIGroup>;

  private _docs: EasyAPIDocs | null = null;
  get docs(): EasyAPIDocs {
    if (this._docs) return this._docs;
    const docs: EasyAPIDocs = {
      groups: [],
    };
    this.actionGroups.forEach((group, groupName) => {
      const groupDocs: EasyAPIGroupDocs = {
        groupName,
        description: group.description,
        actions: [],
      };
      group.actions.forEach((action, actionName) => {
        let params: EasyAPIActionDocs["params"] = [];
        if (action.params) {
          params = Object.entries(action.params)?.map(
            ([paramName, param]) => {
              return {
                paramName,
                required: param.required || false,
                type: param.type,
              };
            },
          );
        }
        groupDocs.actions.push({
          actionName,
          description: action.description,
          params,
        });
      });
      docs.groups.push(groupDocs);
    });
    this._docs = docs;
    return docs;
  }

  getGroup(group: string) {
    return this.actionGroups.get(group);
  }
  getAction(group: string | undefined, action: string | undefined) {
    if (!group) {
      return null;
    }
    const actionGroup = this.getGroup(group);
    if (!actionGroup) return null;
    if (!action) return null;
    return actionGroup.actions.get(action);
  }
  constructor() {
    this.actionGroups = new Map<string, EasyAPIGroup>();
  }

  private _sanitizeName(name: string) {
    return name.replace(/[^a-z0-9]/gi, "");
  }
  addGroup(group: EasyAPIGroup) {
    this.actionGroups.set(group.groupName, group);
  }

  addAction(group: string, action: EasyAPIAction) {
    const actionGroup = this.getGroup(group);
    if (!actionGroup) return;
    actionGroup.actions.set(action.actionName, action);
  }
}
