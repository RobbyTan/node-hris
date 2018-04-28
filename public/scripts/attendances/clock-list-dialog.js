let dialogGlobal = {
  selectedNIK: null,
  selectedDateStr: null,
  clocksCell: null,
  totalTimeCell: null,
  isDosenTidakTetap: null,
  person: null,
  clockPairings: null
};

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": 300,
  "hideDuration": 500,
  "timeOut": 3000,
  "extendedTimeOut": 1000,
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

let clockListDialog = function () {
    // prepare, then show modal dialog
    function showClockListDialog(person) {
      $.getJSON("/api/attendances/" + person.nik, {
        date: person.date
      }).then(clockList => {
        $('#clockListModalTitle').html(`${person.name} <span style="float: right;">[${person.nik}]</span>`);

        $('#clockList').empty();
        clockList.forEach(clock => {
          let clockFormatted = moment(clock.date).format('HH:mm:ss');
          $('#clockList').append(
            `<li id="${clockFormatted}" class="list-group-item d-flex justify-content-between align-items-center">${clockFormatted}<span class="badge badge-primary badge-pill">${clock.type==='manual'?'manual':''}</span></li>`
          );
        });
        $('#clockListModal').modal('show');
      }).catch(err => {
        console.log(err);
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
          url : '/api/attendances',
          headers : {
            nik: dialogGlobal.selectedNIK,
            timestamp: moment(dialogGlobal.selectedDateStr + newClockStr, 'YYYYMMDDHH:mm:ss').toDate()
          },
          success : function(data){
            toastr.info('New Clock Inserted');
            addClockToItsPosition(newClockStr);
            getClocks(dialogGlobal.person, function(clockList) {
              let clockPairs = dialogGlobal.clockPairings.getClockPairs(clockList);
              dialogGlobal.clocksCell.data(dialogGlobal.clockPairings.getFlaggedClockPairs(clockPairs, dialogGlobal.isDosenTidakTetap));
              dialogGlobal.totalTimeCell.data(dialogGlobal.clockPairings.getTotalWorkingTime(clockPairs, dialogGlobal.isDosenTidakTetap));
            })
          },
          error : function() {
            toastr.info('Duplicate/Error occured!');
            console.log("Error occured!");
          }
        })
      });

      function getClocks(person, callback) {
        $.getJSON("/api/attendances/" + person.nik, {
          date: person.date
        }).then(clockList => {
          let clocks = clockList.map(e => moment(e.date));
          callback(clocks);
        }).catch(err => {
          console.log(err);
        });
      }

      function addClockToItsPosition(clockStr) {
        let clockList = $('#clockList').children();
        let i = 0;
        while (clockList[i]) {
          if (moment(clockStr, 'HH:mm:ss').isAfter(moment(clockList[i].id, 'HH:mm:ss')))
            i++;
          else break;
        }
        let newClockHTML = 
          `<li id="${clockStr}" class="list-group-item d-flex justify-content-between align-items-center" style="display:none !important;">${clockStr}<span class="badge badge-primary badge-pill">manual</span></li>`;
        if (i == 0) $(`${newClockHTML}`).insertBefore($(clockList[0]));
        else $(`${newClockHTML}`).insertAfter($(clockList[i-1]));

        $($('#clockList').children()[i]).slideDown(1000);
      }
    }
  return {
    bind: function (config) {
      // double click listener for editable clockList
      $(document).ready(function() {
        let table = $(`#${config.tableId}`).DataTable();
        $(`#${config.tableId} tbody`).on('dblclick', 'td', function () {
          let cell = table.cell(this);
          if (!cell.length || cell.index().column != 6) return;
          let row = cell.index().row;

          let person = {
            nik: table.cell(row, 0).data(),
            name: table.cell(row, 1).data(),
            date: moment(table.cell(row, 4).data(), 'DD MMM YYYY').format("YYYY-M-D")
          };
          dialogGlobal.clockPairings = config.clockPairings;
          dialogGlobal.clocksCell = cell;
          dialogGlobal.totalTimeCell = table.cell(row, 7);
          dialogGlobal.selectedNIK = person.nik;
          dialogGlobal.person = person;
          dialogGlobal.isDosenTidakTetap = table.cell(row, 2).data() === 'Dosen Tidak Tetap';
          dialogGlobal.selectedDateStr = moment(table.cell(row, 4).data(), 'DD MMM YYYY').format("YYYYMMDD");
          showClockListDialog(person);
        });
      });

      // add modal dialogs to bottom of body DOM
      if (config.addModalDialog === true) {
        addModalDialog();
        addEventListener();
      }
    }
  };
};