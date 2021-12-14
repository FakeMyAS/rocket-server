(function() {
    'use strict';
    window.addEventListener('load', function() {
        var form = document.getElementById('needs-validation');
        if(form) {
            form.addEventListener('submit', function(event) {
                $(".form-control:valid + .invalid-feedback").css("display", "none");
                $(".form-control:invalid + .invalid-feedback").css("display", "block");
                
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    $("button[type=submit]").attr("disabled", "disabled");
                    // Removed code to hash the password
                    // var pwd1 = document.getElementById("passwordField");
                    // var pwd2 = document.getElementById("passwordHidden");
                    // if (pwd1 && pwd2) {
                    //     pwd1.style.display = 'none';
                    //     pwd2.style.display = 'block';
                    //     var hashed = Sha256.hash(pwd1.value);
                    //     pwd1.value = hashed;
                    // }
                }
                form.classList.add('was-validated');
            }, false);
        }
    }, false);
})();

// https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
// https://stackoverflow.com/a/25621277/7891095
function ChangeHeight() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

function StartText() {
    var txt = document.getElementsByTagName('textarea');
    for (var i = 0; i < txt.length; i++) {
        txt[i].setAttribute('style', 'height:' + (txt[i].scrollHeight) + 'px;overflow-y:hidden;');
        txt[i].addEventListener("input", ChangeHeight, false);
    }
}






