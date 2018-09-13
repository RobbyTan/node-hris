toastr.options.positionClass = "toast-top-center";

let ClockListDialog = (function () {
  let selectedNIK;
  let selectedDateStr;
  let clocksCell;
  let telatCell;
  let totalTimeCell;
  let jamMasukCell;
  let department;
  let person;
  let firstRun = false;

  function getClocks(person, callback) {
    $.getJSON("/api/attendance/" + person.nik, {
      date: person.date
    }).then(clockList => {
      callback(clockList);
    }).catch(err => {
      console.log(err);
    });
  }

  // prepare, then show modal dialog
  function showClockListDialog(person) {
    getClocks(person, function(clockList) {
      $('#clockListModalTitle').html(`${person.name} <span style="float: right;">[${person.nik}]</span>`);

      $('#clockList').empty();
      clockList.forEach(clock => {
        let clockFormatted = moment(clock.date).format('HH:mm:ss');
        $('#clockList').append(
          `<li id="${clockFormatted}" class="list-group-item d-flex justify-content-between align-items-center">${clockFormatted}<span class="badge badge-primary badge-pill">${clock.type==='manual'?'manual':''}</span></li>`
        );
      });
      $('#clockListModal').modal('show');
    });
  }

  function addModalDialog() {
    $('body').append(
      `<div class="modal fade" id="clockListModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Clock List</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div id="clockListModalBody" class="modal-body">
              <div id="clockListModalTitle" class="alert alert-primary" role="alert"></div>
              <ul id="clockList" class="list-group">
              </ul>
              <br>
              <form id="formClockList" class="form-inline">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="input-group clockpicker">
                      <input type="text" id="newClockTxt" name="maxTime" pattern="^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$" class="form-control" value="" placeholder="HH:mm:ss" required>
                    </div>
                  </div>
                  <button id="insertClockListModalBtn" type="submit" class="btn btn-primary">Insert</button>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button id="closeClockListModalBtn" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="confirmationModal" tabindex="-2" role="dialog" aria-labelledby="exampleModalLabel1" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmation Dialog</h5>
              <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div id="confirmationModalBody" class="modal-body">Insert Are you sure </div>
            <div class="modal-footer">
              <button id="yesConfirmationModalBtn" type="button" class="btn btn-primary">Yes</button>
              <button id="noConfirmationModalBtn" type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
            </div>
          </div>
        </div>
      </div>`
    );
  }

  function addEventListener() {
    $('#formClockList').on('submit', function (err) {
      err.preventDefault();
      $('#confirmationModalBody').html(`Insert new clock (${$('#newClockTxt').val()})<br>Are you sure?`);
      $('#confirmationModal').modal('show');
    });

    // user confirms to insert new clock
    $('#yesConfirmationModalBtn').click(() => {
      let newClockStr = $('#newClockTxt').val();
      $('#confirmationModal').modal('hide');

      $.ajax({
        type:'POST',
        url : '/api/attendance',
        headers : {
          nik: selectedNIK,
          timestamp: moment(selectedDateStr + newClockStr, 'YYYYMMDDHH:mm:ss').toDate()
        },
        success : function(data){
          toastr.info('New Clock Inserted');
          addClockToItsPosition(newClockStr);
          getClocks(person, function(clockList) {
            let clockPairingResult = ClockPairing.process(clockList, {
              dosenTidakTetapMaxTime: dosenTidakTetapMaxTime,
              department: department,
              jamMasuk: jamMasukCell.data()
            });
            let clockPairsDisplay = clockPairingResult.flaggedClockPairs;
            let flaggedTotalWorkingTime = clockPairingResult.flaggedTotalWorkingTime;
            clocksCell.data(clockPairsDisplay);
            if (clockPairingResult.telat5) telatCell.data('TELAT'); else telatCell.data('');
            totalTimeCell.data(flaggedTotalWorkingTime);
            $('#newClockTxt').val('');
          })
        },
        error : function() {
          toastr.info('Duplicate/Error occured!');
          console.log("Error occured!");
        }
      })
    });

    function addClockToItsPosition(clockStr) {
      let clockList = $('#clockList').children();
      let newClockHTML = `<li id="${clockStr}" class="list-group-item d-flex justify-content-between align-items-center" style="display:none !important;">${clockStr}<span class="badge badge-primary badge-pill">manual</span></li>`;
      if (!clockList[0]) {
        $('#clockList').append($(`${newClockHTML}`));
        $($('#clockList').children()[0]).slideDown(1000);
      } else {
        let i = 0;
        while (clockList[i]) {
          if (moment(clockStr, 'HH:mm:ss').isAfter(moment(clockList[i].id, 'HH:mm:ss')))
            i++;
          else break;
        }
        if (i == 0) $(`${newClockHTML}`).insertBefore($(clockList[0]));
        else $(`${newClockHTML}`).insertAfter($(clockList[i-1]));
        $($('#clockList').children()[i]).slideDown(1000);
      }
    }
  }

  function bind(config) {
    // double click listener for editable clockList
    let table = $('#'+config.tableId).DataTable();
    $('#'+config.tableId+' tbody').on('dblclick', 'td', function() {
      let cell = table.cell(this);
      if (!cell.length || cell.index().column != 7) return;
      let row = cell.index().row;

      clocksCell = cell;
      telatCell = table.cell(row, 9);
      totalTimeCell = table.cell(row, 8);
      jamMasukCell = table.cell(row, 6);
      person = {
        nik: table.cell(row, 0).data(),
        name: table.cell(row, 1).data(),
        date: moment(table.cell(row, 5).data(), 'DD MMM YYYY').format("YYYY-M-D")
      };
      selectedNIK = person.nik;
      department = table.cell(row, 2).data();
      selectedDateStr = moment(table.cell(row, 5).data(), 'DD MMM YYYY').format("YYYYMMDD");
      showClockListDialog(person);
    });

    // add modal dialogs to bottom of body DOM
    if (!firstRun) {
      firstRun = true;
      addModalDialog();
      addEventListener();
    }
  }

  return {
    bind: bind
  };
})();