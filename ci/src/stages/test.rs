use dagger_sdk::{Directory, Query};
use eyre::WrapErr;

use crate::containers::node_builder;

/// Install dependencies, build, and run tests.
pub async fn run(client: &Query, source: Directory) -> eyre::Result<String> {
    let output = node_builder(client, source)
        .with_exec(vec!["npm", "ci"])
        .with_exec(vec!["npm", "run", "build"])
        .with_exec(vec!["npm", "test"])
        .with_exec(vec!["sh", "-c", "echo 'test: all tests passed'"])
        .stdout()
        .await
        .wrap_err("test failed")?;

    Ok(output)
}
