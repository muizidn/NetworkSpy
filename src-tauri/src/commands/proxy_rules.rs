use crate::*;
use crate::settings::{InterceptAllowList, ManagedTunnelCloseMap};
use std::sync::Arc;

#[tauri::command]
pub fn get_proxy_rules(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<crate::traffic::db::ProxyRule>, String> {
    Ok(config.get_proxy_rules())
}

#[tauri::command]
pub async fn save_proxy_rule(
    rule: crate::traffic::db::ProxyRule,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
    state: tauri::State<'_, InterceptAllowList>,
    tunnel_state: tauri::State<'_, ManagedTunnelCloseMap>,
) -> Result<(), String> {
    config.save_proxy_rule(rule.clone()).map_err(|e| e.to_string())?;
    refresh_active_proxy_intercept_list(&state, &config).await?;

    close_tunnels_for_host(&tunnel_state, &rule.pattern);

    Ok(())
}

#[tauri::command]
pub async fn delete_proxy_rule(
    id: String,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
    state: tauri::State<'_, InterceptAllowList>,
    tunnel_state: tauri::State<'_, ManagedTunnelCloseMap>,
) -> Result<(), String> {
    let rules = config.get_proxy_rules();
    if let Some(rule) = rules.iter().find(|r| r.id == id) {
        close_tunnels_for_host(&tunnel_state, &rule.pattern);
    }
    config.delete_proxy_rule(id).map_err(|e| e.to_string())?;
    refresh_active_proxy_intercept_list(&state, &config).await?;
    Ok(())
}

pub(crate) async fn refresh_active_proxy_intercept_list(
    state: &InterceptAllowList,
    config: &crate::config::ConfigManager,
) -> Result<(), String> {
    let rules = config.get_proxy_rules();
    let mut new_list = Vec::new();
    for rule in &rules {
        if rule.enabled {
            new_list.push(network_spy_proxy::ProxyRule {
                pattern: rule.pattern.clone(),
                client: rule.client.clone(),
                action: rule.action.clone(),
            });
        }
    }
    let mut list = state.0.write().await;
    *list = new_list;
    Ok(())
}
