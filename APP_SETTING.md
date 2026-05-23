# App Settings (YAML Config)

Application settings are persisted as YAML in the file:

```
~/.network-spy/file.networkspy
```

Under the `proxy_settings` key. The file is managed by the Rust backend via `serde_yaml`.

## Data Flow

```
React UI                  Rust Backend                    Disk
─────────               ──────────────                  ──────
useState()  ──invoke──>  ManagedProxySettings  ──save──>  file.networkspy
            <──invoke──  (in-memory RwLock)   <──load──  (YAML)
```

Two Tauri IPC commands handle the transport:

| Command | Direction | Purpose |
|---------|-----------|---------|
| `get_proxy_settings` | Rust → React | Load settings on app startup |
| `update_proxy_settings` | React → Rust | Persist changes to YAML |

## Files Involved

### Rust Backend

| File | Purpose |
|------|---------|
| `src-tauri/src/settings.rs` | `ProxySettings` struct — define the settings model |
| `src-tauri/src/commands.rs` | `get_proxy_settings` and `update_proxy_settings` IPC handlers |
| `src-tauri/src/config.rs` | `ConfigManager` — reads/writes the YAML file to disk |

### React Frontend

| File | Purpose |
|------|---------|
| `src/context/SettingsProvider.tsx` | React context — exposes settings to all components |
| `src/routes/settings.tsx` | Settings UI page — toggle switches and inputs |

## How to Add a New Setting

Example: adding a boolean setting named `showNotifications`.

### Step 1: Add to Rust `ProxySettings` struct

File: `src-tauri/src/settings.rs`

```rust
#[derive(Serialize, Deserialize, Clone)]
pub struct ProxySettings {
    // ... existing fields ...

    #[serde(default)]
    pub show_notifications: bool,          // <-- ADD THIS
}

impl Default for ProxySettings {
    fn default() -> Self {
        Self {
            // ... existing defaults ...
            show_notifications: false,     // <-- ADD THIS (default value)
        }
    }
}
```

- `#[serde(default)]` ensures old YAML files without this field won't break deserialization.
- If the default is not the type's zero value, use `#[serde(default = "fn_name")]` (see `autosave` for an example of `true` default).

### Step 2: Add to TypeScript context interface

File: `src/context/SettingsProvider.tsx`

**a) Add to the interface type:**
```ts
interface SettingsContextInterface {
  // ... existing ...
  showNotifications: boolean;
  setShowNotifications: (enabled: boolean) => void;
}
```

**b) Add to the default context value:**
```ts
export const SettingsContext = createContext<SettingsContextInterface>({
  // ... existing ...
  showNotifications: false,
  setShowNotifications: () => {},
});
```

**c) Add state with initial value:**
```ts
const [showNotifications, setShowNotifications] = useState(false);
```

**d) Add to `get_proxy_settings` type and handler:**
```ts
invoke<{
  // ... existing fields ...
  show_notifications: boolean;   // snake_case matches Rust field
}>("get_proxy_settings")
  .then((settings) => {
    // ...
    setShowNotifications(settings.show_notifications);
  });
```

**e) Add to `update_proxy_settings` payload and dependency array:**
```ts
invoke("update_proxy_settings", {
  newSettings: {
    // ... existing ...
    show_notifications: showNotifications,  // snake_case matches Rust field
  }
}).catch(console.error);
}, [/* ... existing deps ... */, showNotifications, isLoaded]);
```

**f) Add to Provider value:**
```ts
<SettingsContext.Provider
  value={{
    // ... existing ...
    showNotifications,
    setShowNotifications,
  }}
>
```

### Step 3: Use in a component

```ts
import { useSettingsContext } from "@src/context/SettingsProvider";

const { showNotifications, setShowNotifications } = useSettingsContext();
```

### Step 4: Add UI toggle (optional)

File: `src/routes/settings.tsx`

Follow the pattern of existing toggles (see `smartViewerMatch`, `autosave`) to add a toggle switch in the appropriate tab.

## Migration from localStorage

If a setting was previously stored in `localStorage`, add a one-time migration in the `get_proxy_settings` handler:

```ts
if (!settings.my_field) {
  const legacyValue = localStorage.getItem("ns_my_field");
  if (legacyValue) {
    setMyField(JSON.parse(legacyValue));
    localStorage.removeItem("ns_my_field");
  }
} else {
  setMyField(settings.my_field);
}
```

See `pinnedBottomPaneModes` in SettingsProvider for a working example.
