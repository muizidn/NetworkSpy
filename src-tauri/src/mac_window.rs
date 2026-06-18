#[cfg(target_os = "macos")]
use objc2_app_kit::{
    NSWindow, NSColor, NSWindowButton,
    NSWindowStyleMask, NSWindowTitleVisibility,
};
#[cfg(target_os = "macos")]
use objc2_foundation::{NSPoint, MainThreadMarker};
#[cfg(target_os = "macos")]
use tauri::{Runtime, WebviewWindow};

#[cfg(target_os = "macos")]
pub fn setup_mac_window<R: Runtime>(window: &WebviewWindow<R>) {
    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

    let ptr = window.ns_window().expect("Failed to get NSWindow");
    let ns_window: &NSWindow = unsafe { &*ptr.cast() };

    unsafe {
        let mask = ns_window.styleMask();
        ns_window.setStyleMask(
            mask | NSWindowStyleMask::FullSizeContentView | NSWindowStyleMask::Titled,
        );

        ns_window.setTitleVisibility(NSWindowTitleVisibility::Hidden);
        ns_window.setTitlebarAppearsTransparent(true);

        let bg_color = NSColor::colorWithRed_green_blue_alpha(
            9.0 / 255.0,
            9.0 / 255.0,
            11.0 / 255.0,
            1.0,
        );
        ns_window.setBackgroundColor(Some(&bg_color));

        let mtm = MainThreadMarker::new().expect("must be on main thread");
        let name = objc2_foundation::ns_string!("NSAppearanceNameDarkAqua");
        if let Some(dark_appearance) = objc2_app_kit::NSAppearance::appearanceNamed(name) {
            let app = objc2_app_kit::NSApplication::sharedApplication(mtm);
            app.setAppearance(Some(&dark_appearance));
        }

        position_traffic_lights(ns_window, 13.0, 18.0);
    }

    let _ = apply_vibrancy(window, NSVisualEffectMaterial::UnderWindowBackground, None, None);

    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Resized(..) = event {
            let ptr = window_clone.ns_window().expect("Failed to get NSWindow");
            let ns_window: &NSWindow = unsafe { &*ptr.cast() };
            unsafe {
                ns_window.setTitleVisibility(NSWindowTitleVisibility::Hidden);
                position_traffic_lights(ns_window, 13.0, 18.0);
            }
        }
    });
}

#[cfg(target_os = "macos")]
unsafe fn position_traffic_lights(ns_window: &NSWindow, x: f64, y: f64) {
    let close = ns_window.standardWindowButton(NSWindowButton::CloseButton);
    let miniaturize = ns_window.standardWindowButton(NSWindowButton::MiniaturizeButton);
    let zoom = ns_window.standardWindowButton(NSWindowButton::ZoomButton);

    if let Some(close_btn) = &close {
        if let Some(superview1) = close_btn.superview() {
            if let Some(container) = superview1.superview() {
                let close_rect = close_btn.frame();
                let button_height = close_rect.size.height;

                let mut title_bar_rect = container.frame();
                let title_bar_frame_height = button_height + y;
                title_bar_rect.size.height = title_bar_frame_height;
                title_bar_rect.origin.y = ns_window.frame().size.height - title_bar_frame_height;
                container.setFrame(title_bar_rect);

                let space_between = match (&miniaturize, &close) {
                    (Some(min), Some(cl)) => {
                        min.frame().origin.x - cl.frame().origin.x
                    }
                    _ => 20.0,
                };

                let buttons = [&close, &miniaturize, &zoom];
                for (i, button) in buttons.iter().enumerate() {
                    if let Some(btn) = button {
                        let mut rect = btn.frame();
                        rect.origin.x = x + (i as f64 * space_between);
                        rect.origin.y = (title_bar_frame_height - button_height) / 2.0;
                        btn.setFrameOrigin(NSPoint::new(rect.origin.x, rect.origin.y));
                    }
                }
            }
        }
    }
}
