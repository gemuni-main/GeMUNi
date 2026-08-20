(function () {
  "use strict";

  var form = document.getElementById("waitlistForm");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var messageInput = document.getElementById("message");
  var errorBox = document.getElementById("formError");
  var successBox = document.getElementById("success");
  var submitBtn = document.getElementById("submitBtn");
  var cfg = window.GEMUNI_CONFIG || {};

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.querySelector(".btn-text").textContent = loading ? "Sealing your parchment…" : "Submit to the Chair";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearError();

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var message = messageInput.value.trim();

    if (!name) return showError("The delegation name is required.");
    if (!validEmail(email)) return showError("That correspondence address does not look right.");
    if (!message) return showError("The chair expects a message.");

    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      return showError("The registry is not yet open — please check back shortly.");
    }

    setLoading(true);
    try {
      var res = await fetch(cfg.SUPABASE_URL + "/rest/v1/" + cfg.TABLE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ name: name, email: email, message: message })
      });

      if (!res.ok) {
        var bodyText = await res.text();
        console.error("Waitlist insert failed:", res.status, bodyText);
        throw new Error("registry rejected the entry");
      }

      form.classList.add("hidden");
      successBox.classList.remove("hidden");
    } catch (err) {
      setLoading(false);
      showError("The registry is temporarily unreachable. Please try again in a moment.");
    }
  });
})();