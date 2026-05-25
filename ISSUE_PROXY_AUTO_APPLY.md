### Summary

When using Chrome and adding a host to the proxy/intercept list after a `CONNECT` request is already established, reloading the tab does not make the traffic start capturing immediately.

Currently, Chrome traffic is only captured after fully restarting the browser.

Expected behavior is similar to tools like Proxyman, where refreshing the tab is enough to establish new captured traffic without restarting Chrome.

---

## Steps To Reproduce

1. Open Chrome
2. Visit a website that creates HTTPS traffic
3. Start NetworkSpy
4. Observe `CONNECT` traffic
5. Add the target host/domain into Proxy List / Capture List
6. Reload the browser tab

---

## Expected Behavior

Reloading the tab should recreate or refresh the connection so NetworkSpy immediately starts capturing HTTPS traffic.

No full browser restart should be required.

---

## Actual Behavior

Traffic is still bypassing capture after tab reload.

Only after:

* fully closing Chrome
* reopening Chrome
* reopening the website

does NetworkSpy start capturing traffic.

---

## Possible Cause

Chrome may be reusing existing keep-alive / pooled HTTP connections or persistent HTTP/2 sessions that were established before the proxy rule changed.

Because the existing `CONNECT` tunnel is still alive:

* tab reload reuses old connection
* proxy interception logic is not re-triggered
* NetworkSpy never gets a new TLS handshake

Tools like Proxyman appear to force connection refresh/reset so a normal page reload creates a fresh proxied connection.

---

## Suggested Fix Ideas

Possible approaches:

* Force-close existing upstream connections when proxy rules change
* Invalidate connection pool for affected hosts
* Trigger socket reset / disconnect on matching CONNECT tunnels
* Detect proxy-list updates and terminate active HTTP/2 sessions
* Add “Refresh Connections” action similar to Proxyman
* Force browser reconnect by closing active TCP/TLS tunnel internally

---

## Environment

* Browser: Chrome
* Protocol: HTTPS (`CONNECT`)
* OS: macOS
* App: NetworkSpy

---

## Notes

This issue makes debugging workflow slower because users must completely restart Chrome every time they modify the proxy list.

Modern debugging proxies should allow:

* update proxy rules
* reload tab
* instantly capture traffic

without restarting the browser.

## Implementation Status

**FIXED** - Active CONNECT tunnels are now tracked and forcefully closed when the proxy intercept list is updated.

### Implementation Details

1. **`hudsucker/src/proxy/mod.rs`** - Added `TunnelShutdownMap` type (`Arc<Mutex<HashMap<String, Vec<oneshot::Sender<()>>>>>`) and `tunnel_shutdown` field to `Proxy` struct.

2. **`hudsucker/src/proxy/internal.rs`** - Modified `process_connect` tunnel mode to register shutdown channels via the tunnel map and use `tokio::select!` to break out of `copy_bidirectional` when a shutdown signal is received.

3. **`hudsucker/src/proxy/builder.rs`** - Added `tunnel_shutdown` field and `with_tunnel_shutdown()` builder method.

4. **`network_spy_proxy/src/proxy.rs`** - Created `close_tunnels_for_host()` function and added tunnel shutdown map management.

5. **`src-tauri/src/commands.rs`** - `update_intercept_allow_list` now compares old vs new list and calls `close_tunnels_for_host` for newly added hosts.

6. **`src-tauri/src/main.rs`** - Creates and manages the `TunnelCloseMap` as Tauri managed state, shared between the proxy and commands layer.

### References

In Rust, store active `CONNECT` tunnels by host, and give each tunnel a shutdown signal.

```rust
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{Mutex, oneshot};

type TunnelMap = Arc<Mutex<HashMap<String, Vec<oneshot::Sender<()>>>>>;

// key example: "api.example.com:443"
```

When handling `CONNECT`:

```rust
let (shutdown_tx, shutdown_rx) = oneshot::channel();

active_tunnels
    .lock()
    .await
    .entry(format!("{host}:{port}"))
    .or_default()
    .push(shutdown_tx);

tokio::select! {
    _ = tokio::io::copy_bidirectional(&mut client, &mut upstream) => {},
    _ = shutdown_rx => {
        let _ = client.shutdown().await;
        let _ = upstream.shutdown().await;
    }
}
```

When proxy list changes:

```rust
pub async fn close_tunnels_for_host(
    active_tunnels: TunnelMap,
    host: &str,
    port: u16,
) {
    let key = format!("{host}:{port}");

    if let Some(tunnels) = active_tunnels.lock().await.remove(&key) {
        for shutdown in tunnels {
            let _ = shutdown.send(());
        }
    }
}
```

Core idea:

> When user adds host to proxy list, kill existing `CONNECT host:443` tunnels. Chrome will reconnect on tab reload, and the new tunnel will use updated capture rules.
