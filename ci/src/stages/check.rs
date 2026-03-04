use dagger_sdk::{Directory, Query};
use eyre::WrapErr;

use crate::containers::node_builder;

/// Install dependencies and run TypeScript type checking.
pub async fn run(client: &Query, source: Directory) -> eyre::Result<String> {
    let output = node_builder(client, source)
        .with_exec(vec!["npm", "ci"])
        .with_exec(vec!["npx", "tsc", "--noEmit"])
        .with_exec(vec!["sh", "-c", "echo 'check: tsc passed'"])
        .stdout()
        .await
        .wrap_err("check failed")?;

    Ok(output)
}
