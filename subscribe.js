$(document).ready(function() {
    // Fade in the body content only for subscribe.html
    if ($('body').hasClass('subscribe-page')) {
        $('body').css('opacity', '1');
    }

    const formSteps = $(".form-step");
    let currentStep = 0;

    function showStep(stepIndex) {
        formSteps.removeClass("active").eq(stepIndex).addClass("active").fadeIn();
        setTimeout(() => loadQuestionAndInput(stepIndex), 100);  // Delay to ensure smooth transition
    }

    function loadQuestionAndInput(stepIndex) {
        const questionElement = formSteps.eq(stepIndex).find(".question");
        const inputElement = formSteps.eq(stepIndex).find("input");

        const text = questionElement.data("question");
        questionElement.text(text).addClass("loaded");
        inputElement.addClass("loaded");
    }

    $(".next-step").click(function() {
        const inputElement = formSteps.eq(currentStep).find("input")[0];
        if (!inputElement.checkValidity()) {
            inputElement.reportValidity();
            return; // Prevent going to the next step if the input is invalid
        }

        if (currentStep < formSteps.length - 1) {
            formSteps.eq(currentStep).removeClass("active").hide(); // Hide the current step
            formSteps.eq(currentStep).find(".question").removeClass("loaded");
            formSteps.eq(currentStep).find("input").removeClass("loaded");
            currentStep++;
            showStep(currentStep);
        }
    });

    // Handle Enter key press for input fields
    $("input").on("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const visibleButton = formSteps.eq(currentStep).find("button:visible");
            visibleButton.click();
        }
    });

    // Show the first step with fade-in effect on page load
    showStep(currentStep);

    // Handle form submission via AJAX
    $('#subscribe-form').submit(function(event) {
        event.preventDefault();
        const inputElement = formSteps.eq(currentStep).find("input")[0];
        if (!inputElement.checkValidity()) {
            inputElement.reportValidity();
            return; // Prevent form submission if the input is invalid
        }

        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'jsonp', // Mailchimp requires JSONP
            jsonp: 'c', // Use 'c' to specify the callback parameter name expected by Mailchimp
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
                if (response.result === 'success') {
                    $('#subscribe-form').hide();
                    $('#success-message').fadeIn();
                } else {
                    alert(response.msg || 'There was an error submitting the form. Please try again.');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('There was an error submitting the form. Please try again.');
            }
        });
    });
});