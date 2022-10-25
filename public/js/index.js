var check = function () {
  if (
    document.getElementById("newPassword").value ==
    document.getElementById("verifyPassword").value
  ) {
    document.getElementById("message").style.color = "green";
    document.getElementById("message").innerHTML = "Passwords Match";
  } else {
    document.getElementById("message").style.color = "red";
    document.getElementById("message").innerHTML = "Passwords Do Not Match";
  }
};

var sendEmail = function () {
  var email = "hmoodie@moodielaw.com";
  var subject = "Forgot password";
  var emailBody = `For security reasons, only the Network Administrator can reset passwords. Please provide your username and a copy of your company or government issued photo ID to support your request.`;
  document.location =
    "mailto:" + email + "?subject=" + subject + "&body=" + emailBody;
};
