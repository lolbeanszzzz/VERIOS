import { loginWithAccount, registerAccount, getAccountStatus, signOutAccount } from "./userIdentity.js";
import { $, $$, bindEvent, setText } from "../shared/domUtils.js";
import { escapeHtml } from "../utils/utils.js";
import { callIfFunction } from "../shared/functionUtils.js";

export const ACCOUNT_DISCLAIMER = "This is a VERI OS login. VERI OS is not affiliated with Steam or Valve.";

export function buildAccountStatusHtml() {
  const account = getAccountStatus();
  if (account) {
    return `
      <div class="veri-account-meta">Signed in as <strong>${escapeHtml(account.nickname)}</strong></div>
      <div class="veri-account-actions">
        <button type="button" class="veri-account-btn" data-account-action="signout"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/system-log-out.svg" class="papirus-icon papirus-icon--22" alt="" /> Sign Out</button>
      </div>
    `;
  }
  return `
    <p class="veri-account-note">Sign in or convert your local account to a cloud account to keep your profile, achievements and playtime across devices. No email needed.</p>
    <div class="veri-account-actions">
      <button type="button" class="veri-account-btn" data-account-action="signin"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/system-log-out.svg" class="papirus-icon papirus-icon--22" alt="" /> Sign In</button>
      <button type="button" class="veri-account-btn veri-account-btn--primary" data-account-action="register"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/cloud-upload.svg" class="papirus-icon papirus-icon--22" alt="" /> Sync with Cloud</button>
    </div>
  `;
}

export function buildAccountBlockHtml(startView, options = {}) {
  if (options.socialDisabled) {
    return `
      <div class="veri-account-body">
        <p class="veri-account-note"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/im-user-offline.svg" class="papirus-icon papirus-icon--22" alt="" /> Social features are disabled.</p>
        <div class="veri-account-actions">
          <button type="button" class="veri-account-btn" data-account-action="enable-social"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/object-select.svg" class="papirus-icon papirus-icon--22" alt="" /> Enable in Settings</button>
        </div>
      </div>
    `;
  }
  const start = startView === "signin" || startView === "register" ? startView : null;
  const signinHidden = start === "signin" ? "" : " hidden";
  const registerHidden = start === "register" ? "" : " hidden";
  const nicknameValue = options.prefillNickname ? ` value="${escapeHtml(options.prefillNickname)}"` : "";
  const anonymousNote = options.anonymousNote
    ? `<p class="veri-account-note">${escapeHtml(options.anonymousNote)}</p>`
    : "";
  const conversionNote = options.prefillNickname
    ? '<p class="veri-account-note">Creating an account turns your current local profile into a registered account. Your games, achievements and playtime stay linked.</p>'
    : "";
  return `
    <div class="veri-account-body${start ? " hidden" : ""}">
      ${buildAccountStatusHtml()}
      ${anonymousNote}
    </div>
    <div class="veri-account-form veri-account-form--signin${signinHidden}">
      <label class="veri-account-label">Nickname</label>
      <input type="text" class="veri-account-input veri-account-input--identifier" placeholder="Nickname" autocomplete="username" />
      <label class="veri-account-label">Password</label>
      <input type="password" class="veri-account-input veri-account-input--signin-pass" placeholder="Password" autocomplete="current-password" />
      <div class="veri-account-error hidden"></div>
      <div class="veri-account-actions">
        <button type="button" class="veri-account-btn veri-account-btn--primary" data-account-action="signin-submit"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/system-log-out.svg" class="papirus-icon papirus-icon--22" alt="" /> Sign In</button>
        <button type="button" class="veri-account-btn" data-account-action="switch-register"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/list-add.svg" class="papirus-icon papirus-icon--22" alt="" /> Sync with Cloud</button>
      </div>
    </div>
    <div class="veri-account-form veri-account-form--register${registerHidden}">
      ${conversionNote}
      <label class="veri-account-label">Nickname</label>
      <input type="text" class="veri-account-input veri-account-input--nickname" maxlength="32" placeholder="Nickname (3+ characters)" autocomplete="nickname"${nicknameValue} />
      <label class="veri-account-label">Password</label>
      <input type="password" class="veri-account-input veri-account-input--register-pass" placeholder="Password (6+ characters)" autocomplete="new-password" />
      <div class="veri-account-error hidden"></div>
      <div class="veri-account-actions">
        <button type="button" class="veri-account-btn veri-account-btn--primary" data-account-action="register-submit"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/cloud-upload.svg" class="papirus-icon papirus-icon--22" alt="" /> Sync with Cloud</button>
        <button type="button" class="veri-account-btn" data-account-action="switch-login"><img src="https://cdn.jsdelivr.net/gh/PapirusDevelopmentTeam/papirus-icon-theme@master/Papirus/22x22/actions/system-log-out.svg" class="papirus-icon papirus-icon--22" alt="" /> Switch to Login</button>
      </div>
    </div>
  `;
}

export function bindAccountBlock(root, { onChange, onEnableSocial } = {}) {
  const body = $(".veri-account-body", root);
  const signinForm = $(".veri-account-form--signin", root);
  const registerForm = $(".veri-account-form--register", root);
  const errorEls = $$(".veri-account-error", root);

  const setErrorsHidden = () => errorEls.forEach((el) => el.classList.add("hidden"));

  const show = (view) => {
    if (body) body.classList.toggle("hidden", view !== "body");
    if (signinForm) signinForm.classList.toggle("hidden", view !== "signin");
    if (registerForm) registerForm.classList.toggle("hidden", view !== "register");
    setErrorsHidden();
  };

  const setError = (index, message) => {
    if (errorEls[index]) {
      setText(errorEls[index], message);
      errorEls[index].classList.remove("hidden");
    }
  };

  const refresh = () => {
    callIfFunction(onChange);
  };

  bindEvent(root, "click", async (e) => {
    const btn = e.target.closest("[data-account-action]");
    if (!btn) return;
    const action = btn.dataset.accountAction;
    if (action === "signin") {
      show("signin");
      return;
    }
    if (action === "register") {
      show("register");
      return;
    }
    if (action === "switch-register") {
      show("register");
      return;
    }
    if (action === "switch-login") {
      show("signin");
      return;
    }
    if (action === "signout") {
      signOutAccount();
      refresh();
      return;
    }
    if (action === "enable-social") {
      callIfFunction(onEnableSocial);
      return;
    }
    if (action !== "signin-submit" && action !== "register-submit") return;

    btn.disabled = true;
    try {
      let result;
      if (action === "signin-submit") {
        const identifier = $(".veri-account-input--identifier", root);
        const password = $(".veri-account-input--signin-pass", root);
        const idValue = identifier ? identifier.value.trim() : "";
        const passValue = password ? password.value : "";
        if (!idValue || !passValue) {
          setError(0, "Enter your nickname and password.");
          return;
        }
        result = await loginWithAccount(idValue, passValue);
      } else {
        const nickname = $(".veri-account-input--nickname", root);
        const password = $(".veri-account-input--register-pass", root);
        const nickValue = nickname ? nickname.value.trim() : "";
        const passValue = password ? password.value : "";
        if (nickValue.length < 3 || nickValue.length > 32) {
          setError(1, "Nickname must be 3-32 characters.");
          return;
        }
        if (passValue.length < 6) {
          setError(1, "Password must be at least 6 characters.");
          return;
        }
        result = await registerAccount({ nickname: nickValue, password: passValue });
      }
      if (result && result.error) {
        setError(action === "signin-submit" ? 0 : 1, result.error);
        return;
      }
      refresh();
    } finally {
      btn.disabled = false;
    }
  });
}
