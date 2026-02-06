namespace Buildy.Domain;

public enum WorkflowState
{
    Init,
    Spec,
    Plan,
    AppCode,
    Test,
    Security,
    Infra,
    Deploy,
    WaitingForApproval,
    Done,
    Fail
}
