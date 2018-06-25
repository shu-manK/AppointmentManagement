$(function () {

        //data picker with past date validation
        $("#txtDate").datepicker({
            format: "mm/dd/yyyy",
            startDate: "0d"
        }).on('changeDate', function (e) {
            $(this).datepicker('hide');
        });

        //handlers for button click and to display/hide the form
        $("#btnNew").click(() => {
            $("#btnNew").hide();
            $("#addNew").show();
        });
        $("#btnCancel").click(() => {
            $("#addNew").hide();
            $("#btnNew").show();
            $("#error").html("").hide();
        });

        // Gets the search text from the textarea and call the getAppointments method with that value
        $("#btnSearch").on('click', () => {
            let txtValue = $("#txtInput").val();
            getAppointments(txtValue);
        });

        // renders the DOM with the data from the database
        let getAppointments = (strSearch) => {
            $.ajax({
                url: 'src/perlscript/index.pl',
                type: "get",
                data: {searchText: strSearch},
                success: (data) => {
                    data = $.parseJSON(data);
                    $("#tblBody").html("");
                    $.each(data, (key, value) => {
                        let countColumn = $("<td></td>").html(key + 1);
                        let dataColumn = $("<td></td>").html(moment(value['date'], "MM/DD/YYYY").format('ll'));
                        let timeColumn = $("<td></td>").html(value['time']);
                        let descColumn = $("<td></td>").html(value['description']);
                        let row = $("<tr></tr>").append(countColumn).append(dataColumn).append(timeColumn).append(descColumn);
                        $("#tblBody").append(row);
                    });
                },
                error: (m) => {
                    console.log(m);
                }
            });
        };

        // Validation done for date, time and description
        $("#addNew").on('submit', () => {
            let date = $("#txtDate").val();
            let time = $("#txtTime").val().toUpperCase();
            let desc = $("#txtDescription").val();
            let datePattern = new RegExp(/^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/);
            let timePattern = new RegExp(/^\b((1[0-2]|0?[1-9]):([0-5][0-9]) ([AaPp][Mm]))$/);
            if (date === "" || !datePattern.test(date)) {
                $("#error").html("Date is invalid, Required pattern is 'mm/dd/yyyy'").show();

                return false;
            }
            if (time === "" || !timePattern.test(time)) {
                $("#error").html("Please enter time,Required pattern is 'hh:mm am/pm'").show();
                return false;
            }

            let fullDate = moment(date + " " + time, "MM/DD/YYYY hh:mm A");
            if (moment().isAfter(fullDate)) {
                $("#error").html("Appointments can't be made in the past").show();
                return false;
            }

            if (desc === "") {
                $("#error").html("Please enter the description").show();
                return false;
            }
        });

        //loads all the appointments
        getAppointments();
    }
);