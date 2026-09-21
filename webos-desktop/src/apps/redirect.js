import { BaseApp, os } from "../framework.js";

const CLASSROOM_URL = "https://classroom.google.com";

export class RedirectApp extends BaseApp {
  open() {
    const redirectWindow = window.open("about:blank", "_blank", "noopener,noreferrer");

    if (!redirectWindow) {
      os.dialog.alert("Redirect", "Allow pop-ups to open Google Classroom.");
      return null;
    }

    redirectWindow.location.replace(CLASSROOM_URL);
    return redirectWindow;
  }

  onClose() {}
}

export default RedirectApp;
