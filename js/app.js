var app = angular.module("Budget", []);

app.controller("HomePageController", [
    "$http", "$location", "$window",
    function ($http, $location, $window) {
        //need to load from db
        var s = this;

        this.reload_data = function () {
            $http.post("/get-transactions").then(function (res) {
                s.transactions = res.data;
                s.first_id = res.data[0].id;
                for (var i = 0; i < s.transactions.length; i++) {
                    s.transactions[i].date = s.transactions[i].date.substring(0, 10);
                    delete s.transactions[i].id;
                }

                s.load_stats();

            });
        };

        this.load_stats = function () {
            var total = 0;
            var h = -1;
            var unsignedTotal = 0;
            for (var i = 0; i < s.transactions.length; i++) {
                var a = parseFloat(s.transactions[i].amount);
                unsignedTotal += Math.abs(a);
                total += s.transactions[i].type.toUpperCase() == "CREDIT" ? a : -1 * a;
                h = a > h ? a : h;
            }
            s.balance = total;
            s.high = h;
            s.average = unsignedTotal / s.transactions.length;

            if (s.transactions.length == 0) {
                s.balance = s.high = s.average = 0;
            }
        };
        this.reload_data();
        this.toValidDate = function (d) {
            return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
        };
        this.addTransaction = function () {
            console.log(s.date);
            var data = {
                data: [s.toValidDate(s.date), s.description, s.amount, s.type]
            };
            $http.post("/add", data).then(
                function (res) {
                    $("#add-transaction").dialog("close");
                    $("<div>Success!</div>").dialog({
                        modal: true,
                        resizable: false,
                        draggable: false,
                        title: "The transaction was successfully inserted"
                    });
                    s.reload_data();
                },
                function (err) {
                    $("#add-transaction").dialog("close");
                    $("<div>Failure!</div>").dialog({
                        modal: true,
                        resizable: false,
                        draggable: false,
                        title: "The transaction failed to be added"
                    });
                }
            );
        };

        this.deleteTransaction = function () {
            var i = parseInt(this.transDelete);
            var removed = this.transactions.splice(i, 1);
            this.load_stats();
            $http.post("/delete-transaction", removed).then(function (res) {
                $("#delete-transaction").dialog("close");
                $("<div>Success!</div>").dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    title: "The transaction was successfully deleted"
                });
                s.reload_data();
            }, function (err) {
                $("#delete-transaction").dialog("close");
                $("<div>Failure!</div>").dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    title: "The transaction failed to be added"
                });
            })
        };

        this.showAddTransaction = function () {
            $("#add-transaction").dialog({
                modal: true,
                resizable: false,
                draggable: false,
                title: "Add Transaction"
            });
        };

        this.showDeleteTransaction = function () {
            $("#delete-transaction").dialog({
                modal: true,
                resizable: false,
                draggable: false,
                title: "Delete Transaction"
            });
        };

        this.editTransaction = function (i) {
            // console.log(i)
            $window.location = "/edit-transaction?id=" + (this.first_id + i - 1);
        };

        this.show_graph = function () {
            var a = [];

            this.transactions.forEach(function (t) {
                a.push(t.amount);
            });
            create_graph(a, "test-id");
        }

        this.submitVisualize = function () {
            this.reload_data();
            var today = new Date();
            var days = 0;
            var num = parseInt(this.num);
            if (this.length == "months") {
                days = num * 30;
            }
            else if (this.length == "weeks") {
                days = num * 7;
            }
            else {
                days = num;
            }

            var newDay = new Date();
            while (Math.ceil(Math.abs(today.getTime() - newDay.getTime()) / (1000 * 3600 * 24)) < days) {
                newDay.setDate(newDay.getDate() - 1);
            }

            var data = [];
            for (var i = 0; i < this.transactions.length; i++) {
                var temp_date = this.transactions[i].date + "";
                var year = parseInt(temp_date.substring(0, 4));
                var month = parseInt(temp_date.substring(5, 7));
                var day = parseInt(temp_date.substring(8));
                var new_date = year + "-" + month + "-" + day;
                var d = Date.parse(new_date);
                if (d >= newDay && d <= today) {
                    data.push(parseFloat(this.transactions[i].amount));
                }
            }

            if (data.length > 0) {
                create_graph(data, 'chart');
            } else {
                $("<div>No transactions occurred in the time specified</div>").dialog({
                    modal: true,
                    draggable: false,
                    title: "Not Found",
                    resizable: false
                })
            }
        };


        this.submitVisualizeTwoDates = function () {
            var date1 = this.date1;
            var date2 = this.date2;
            this.reload_data();
            var data = [];
            for (var i = 0; i < this.transactions.length; i++) {
                var temp_date = this.transactions[i].date + "";
                var year = parseInt(temp_date.substring(0, 4));
                var month = parseInt(temp_date.substring(5, 7));
                var day = parseInt(temp_date.substring(8));
                var new_date = year + "-" + month + "-" + day;
                var d = Date.parse(new_date);
                if (d >= date1 && d <= date2) {
                    data.push(parseFloat(this.transactions[i].amount));
                }
            }

            if (data.length > 0) {
                create_graph(data, 'chart');
            } else {
                $("<div>No transactions occurred in the time specified</div>").dialog({
                    modal: true,
                    draggable: false,
                    title: "Not Found",
                    resizable: false
                })
            }
        }
    }

]);

app.directive("addTransaction", function () {
    return {
        templateUrl: "html/add-transaction-form.html"
    };
});

app.directive("transactionTable", function () {
    return {
        templateUrl: "html/transaction_table.html"
    };
});

app.directive("deleteTransaction", function () {
    return {
        templateUrl: "html/delete-transaction-form.html"
    };
});

app.controller("createAccountController", function () {
    this.submitForm = function () {
        alert("Submit! Needs Work")
    }
})

/**********************************************************************************
 * GENERAL PURPOSE
 */

function showDialog(id) {
    $('#' + id).dialog({
        modal: true,
        resizable: false,
        draggable: false,
    })
}