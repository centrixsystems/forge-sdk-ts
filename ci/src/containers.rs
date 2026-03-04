use dagger_sdk::{Container, Directory, Query};

/// Base Node.js container with npm cache.
pub fn node_builder(client: &Query, source: Directory) -> Container {
    let npm_cache = client.cache_volume("forge-sdk-ts-npm");

    client
        .container()
        .from("node:22-slim")
        .with_mounted_directory("/build", source)
        .with_workdir("/build")
        .with_mounted_cache("/root/.npm", npm_cache)
}
