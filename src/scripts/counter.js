var options = {
  useEasing : true, 
  useGrouping : true, 
  separator : ',', 
  decimal : '.', 
  prefix : '', 
  suffix : '' 
};

$.get("http://interview.lenderprice.com:7070/api/jobs")
  .done(function( data ) {
    var taskCount = data.length;
    var taskCounter = new CountUp("taskCounter", 0, taskCount, 0, 10, options);
    taskCounter.start();
});

$.get("http://interview.lenderprice.com:7070/api/assignee")
  .done(function( data ) {
    var assigneeCount = data.length;
    var assigneeCounter = new CountUp("assigneeCounter", 0, assigneeCount, 0, 10, options);
    assigneeCounter.start();
});
