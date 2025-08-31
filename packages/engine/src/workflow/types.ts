import { DirectedGraph } from "graphology";
import { TSchema } from "@sinclair/typebox";
import { type GetStepTools, type Inngest } from "inngest";
import { INode } from "@repo/common";

export interface EngineOptions {
  actions?: Array<EngineAction>;

  /**
   * disableBuiltinActions disables the builtin actions from being used.
   *
   * For selectively adding built-in actions, set this to true and expose
   * the actions you want via the `availableActions` prop (in your Engine)
   */
  disableBuiltinActions?: boolean;

  loader?: Loader;
}

// TODO: Define event type more clearly.
export type TriggerEvent = Record<string, any>;

/**
 * PublicEngineAction is the type representing an action in the *frontend UI*.  This is
 * a subset of the entire EngineAction type.
 *
 * Actions for workflows are defined in the backend, directly on the Engine.  The Engine
 * provides an API which lists public information around the available actions - this type.
 */
export interface PublicEngineAction {
  /**
   * Kind is an enum representing the action's ID.  This is not named as "id"
   * so that we can keep consistency with the WorkflowAction type.
   */
  kind: string;

  /**
   * Name is the human-readable name of the action.
   */
  name: string;

  /**
   * Description is a short description of the action.
   */
  description?: string;

  /**
   * Icon is the name of the icon to use for the action.  This may be an HTTP
   * URL, or an SVG directly.
   */
  icon?: string;

  /**
   * Inputs define input variables which can be configured by the workflow UI.
   */
  inputs?: Record<string, ActionInput>;

  /**
   * Outputs define the responses from the action, including the type, name, and
   * an optional description
   */
  outputs?: TSchema | Record<string, ActionOutput>;

  edges?: {
    /**
     * allowAdd controls whether the user can add new edges to the graph
     * via the "add" handle.
     *
     * If undefined this defaults to true (as most nodes should allow adding
     * subsequent actions).
     */
    allowAdd?: boolean;

    /**
     * Edges allows the definition of predefined edges from this action,
     * eg. "True" and "False" edges for an if statement, or "Not received"
     * edges if an action contains `step.waitForEvent`.
     */
    edges?: Array<PublicEngineEdge>;
  };
}

export type PublicEngineEdge = Omit<WorkflowEdge, "from" | "to">;

/**
 * EngineAction represents a reusable action, or step, within a workflow.  It defines the
 * kind, the handler to run, the McpInterfaces.ts for the action, and optionally custom UI for managing
 * the action's configuration within the workflow editor.
 *
 * Note that this is the type representing an action in the *backend workflow*.
 *
 */
export interface EngineAction<TClient extends Inngest = Inngest>
  extends PublicEngineAction {
  /**
   * The handler is the function which runs the action.  This may comprise of
   * many individual inngest steps.
   */
  handler: ActionHandler<GetStepTools<TClient>>;
}

/**
 * ActionHandler runs logic for a given EngineAction
 */
export type ActionHandler<S> = (args: ActionHandlerArgs<S>) => Promise<ActionResult>;

export interface ActionInput {
  /**
   * Type is the TypeBox type for the input.  This is used for type checking, validation,
   * and form creation.
   *
   * Note that this can include any of the JSON-schema refinements within the TypeBox type.
   *
   * @example
   * ```
   * type: Type.String({
   *   title: "Email address",
   *   description: "The email address to send the email to",
   *   format: "email",
   * })
   * ```
   */
  type: TSchema;

  /**
   * fieldType allows customization of the text input component, for string McpInterfaces.ts.
   */
  fieldType?: "textarea" | "text";
}

export interface ActionOutput {
  type: TSchema;
  description?: string;
}

/**
 * Workflow represents a defined workflow configuration, with a chain or DAG of actions
 * configured for execution.
 *
 */
export interface Workflow {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;

  actions: Array<WorkflowAction>;
  edges: Array<WorkflowEdge>;
  subflows: Record<string, Workflow>;
  state?: Record<string, any>;
}

/**
 * WorkflowAction is the representation of an action within a workflow instance.
 */
export interface WorkflowAction {
  /**
   * The ID of the action within the workflow instance.  This is used as a reference and must
   * be unique within the Instance itself.
   *
   */
  id: string;

  /**
   * The action kind, used to look up the EngineAction definition.
   *
   */
  kind: string;

  name?: string;
  description?: string;

  /**
   * Inputs is a list of configured inputs for the EngineAction.
   *
   * The record key is the key of the EngineAction inoput name, and
   * the value is the variable's value.
   *
   * This will be type checked to match the EngineAction type before
   * save and before execution.
   *
   * Ref inputs for interpolation are "!ref($.<path>)",
   * eg. "!ref($.event.data.email)"
   */
  inputs?: Record<string, any>;

  node?: INode;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  subflow: string;

  /**
   * The name of the edge to show in the UI
   */
  name?: string;

  /**
   * Conditional is a ref (eg. "!ref($.action.ifcheck.result)") which must be met
   * for the edge to be followed.
   *
   * The `conditional` field is automatically set when using the built-in if
   * action.
   *
   */
  conditional?: {
    /**
     * type indicates whether this is the truthy if, the else block, or a
     * "select" case block which must match a given value.
     *
     * for "if", the value will be inteprolated via "!!" to a boolean.
     * for "else", the value is will be evaluated via "!" to a boolean.
     * for "match", the value is will be evaluated via "===" to a boolean.
     *
     * It is expected that "if" blocks are used with json-logic,
     * which create these conditional edges by default - hence the basic
     * boolean logic.
     *
     * This may change in the future; we may add json-logic directly here.
     */
    type: "if" | "else" | "match";
    /**
     * The ref to evaluate.  This can use the shorthand: `!ref($.output)` to
     * refer to the previous action's output.
     */
    ref: string; // Ref input, eg. "!ref($.output.email_id)"
    /**
     * Value to match against, if type is "match"
     */
    value?: any;
  };
}

/**
 * Loader represents a function which takes an Inngest event, then returns
 * a workflow Instance.
 *
 * For example, you may write a function which looks up a user's workflow,
 * stored as JSON, in a DB, unmarshalled into an Instance.
 *
 * If an Instance is not found, this should throw an error.
 */
export type Loader = (event: any) => Promise<Workflow | null | undefined>;

export type DAG = DirectedGraph<Node, Edge>;

export interface Node {
  kind: "$action" | "$source";
  id: string;
  action?: WorkflowAction;
}

export interface Edge {
  edge: WorkflowEdge;
}

export interface ActionHandlerArgs<S = any> {
  /**
   * Event is the event which triggered the workflow.
   */
  event: TriggerEvent;

  /**
   * Step are the step functions from Inngest's SDK, allowing each
   * action to be executed as a durable step function.  This exposes
   * all step APIs: `step.run`, `step.waitForEvent`, `step.sleep`, etc.
   *
   */
  step: S;

  /**
   * Workflow is the workflow definition.
   */
  workflow: Workflow;

  /**
   * WorkflowAction is the action being executed, with fully interpolate
   * inputs.
   */
  workflowAction: WorkflowAction;

  /**
   * State represnets the current state of the workflow, with previous
   * action's outputs recorded as key-value pairs.
   */
  state: any;

  publish?: any;
}

export type RunArgs = {
  event: any;
  step: any;
  workflow?: Workflow;
  state?: Map<string, any>;
  publish: any;
};

export type ActionResult = {
    data?: any,
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BREAK';
}