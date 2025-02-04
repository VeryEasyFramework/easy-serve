import type {
  EasyAPIAction,
  EasyAPIActionDocs,
  EasyAPIDocs,
  EasyAPIGroup,
  EasyAPIGroupDocs,
} from "#extensions/easyApi/src/types.ts";

/**
 * EasyAPI is a class that provides the main interface for the EasyAPI extension for EasyServe.
 */
export class EasyAPI {
  actionGroups: Map<string, EasyAPIGroup>;

  private _docs: EasyAPIDocs | null = null;

  /**
   * Get a JSON object representing the API groups and actions.
   */
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

  /**
   * Get information about a group.
   * @param group {string}
   * @returns {EasyAPIGroup | undefined}
   */
  getGroup(group: string): EasyAPIGroup | undefined {
    return this.actionGroups.get(group);
  }

  /**
   * Get information about an action.
   * @param group {string}
   * @param action {string}
   * @returns {EasyAPIAction | undefined}
   */
  getAction(
    group: string | undefined,
    action: string | undefined,
  ): EasyAPIAction | undefined {
    if (!group) {
      return;
    }
    const actionGroup = this.getGroup(group);
    if (!actionGroup) return;
    if (!action) return;
    return actionGroup.actions.get(action);
  }
  constructor() {
    this.actionGroups = new Map<string, EasyAPIGroup>();
  }

  private _sanitizeName(name: string) {
    return name.replace(/[^a-z0-9]/gi, "");
  }

  /**
   * Add a group to the API. The group name must be unique.
   * @param group {EasyAPIGroup}
   * @returns {void}
   */
  addGroup(group: EasyAPIGroup): void {
    if (this.actionGroups.has(group.groupName)) {
      throw new Error(`Group with name ${group.groupName} already exists`);
    }
    this.actionGroups.set(group.groupName, group);
  }

  /**
   * Add an action to a group. The action name must be unique within the group.
   * @param group {string}
   * @param action {EasyAPIAction}
   * @returns {void}
   */
  addAction(group: string, action: EasyAPIAction): void {
    const actionGroup = this.getGroup(group);
    if (!actionGroup) return;
    actionGroup.actions.set(action.actionName, action);
  }
}
