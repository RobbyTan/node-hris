let DateInputValidator = (function() {
  let $fromTxt;
  let $toTxt;

  function _showToastr(status) {
    let msg;
    if (status === 'blank') {
      msg = 'FROM or TO is unspecified.';
    } else if (status === 'invalid') {
      msg = 'FROM date is after TO date.';
    }
    toastr.error(msg);
  };

  function isValid() {
    let fromStr = $fromTxt.val();
    let toStr = $toTxt.val();

    if (fromStr === '' || toStr === '') {
      _showToastr('blank');
      return false;
    } else if (moment(fromStr).isAfter(toStr)) {
      _showToastr('invalid');
      return false;
    } else {
      return true;
    }
  }

  function bind(options) {
    $fromTxt = $('#' + (options.fromTxt || 'from_txt'));
    $toTxt = $('#' + (options.toTxt || 'to_txt'));
    return {
      isValid: isValid
    };
  }

  return {
    bind: bind
  };
})();