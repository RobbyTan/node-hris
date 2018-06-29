let LoadingSpinner = (function() {
  let $spinner;
  // let $hideableNodes = [];
  let hideableNodes = [];
  let $disableNodes = [];

  // reset kondisi ke semula, hide spinner dan elemen-elemen tertentu
  function init() {
    // $hideableNodes.forEach($node => {
    //   $node.fadeOut(0);
    // });
    hideableNodes.forEach(nodeId => {
      $('#'+nodeId).fadeOut(0);
    });
    $disableNodes.forEach($node => {
      $node.prop("disabled", false);
    });
    $spinner.fadeOut(0);
  }

  // mulai animasi loading, show spinner, hide dan disable elemen tertentu
  function start() {
    // $hideableNodes.forEach($node => {
    //   $('#' + $node.attr('id')).fadeOut();
    // });
    hideableNodes.forEach(nodeId => {
      $('#'+nodeId).fadeOut();
    });
    $disableNodes.forEach($node => {
      $node.prop("disabled", true);
    });
    $spinner.fadeIn();
  }

  // stop animasi loading, show spinner, show dan enable elemen tertentu
  function stop() {
    // $hideableNodes.forEach($node => {
    //   $node.fadeIn();
    // });
    hideableNodes.forEach(nodeId => {
      $('#'+nodeId).fadeIn();
    });
    $disableNodes.forEach($node => {
      $node.prop("disabled", false);
    });
    $spinner.fadeOut();
  }

  function bind(options) {
    $spinner = $('#' + (options.spinner || 'spinner'));
    // for (let nodeId of options.hideableNodes) $hideableNodes.push($('#' + nodeId));
    for (let nodeId of options.hideableNodes) hideableNodes.push(nodeId);
    for (let nodeId of options.disableNodes) $disableNodes.push($('#' + nodeId));

    init();

    return {
      init: init,
      start: start,
      stop: stop
    };
  }

  return {
    bind: bind
  };
})();