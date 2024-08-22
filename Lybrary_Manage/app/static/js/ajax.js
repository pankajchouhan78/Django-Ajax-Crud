$(document).ready(function() {

  $('#update_save_button').hide();
  $('#save_button').hide();
  GetData();

  function GetData(search_value=null) {
    $.ajax({
      headers: {
        'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val()
      },
      url: '/library/dashboard/',
      method: 'POST',
      data: {
        search_value: search_value
      },
      success: function(response) {
        // console.log('Server Response:', response);

        const tbody = $('#books-tbody');
        tbody.empty();  // Clear existing rows

        response.Books.forEach((book, index) => {
          const row = $('<tr></tr>');
          row.append('<th scope="row">' + (index + 1) + '</th>');
          row.append('<td>' + book.title + '</td>');

          const description = book.description;
          const maxLength = 100;
          const truncatedDescription = description.length > maxLength
            ? description.substring(0, maxLength) + '...'
            : description;
          
          row.append('<td>' + truncatedDescription + '</td>');

          let actions = '';
          if (response.permision_list.includes('change_book')) {
            actions += '<button class="btn btn-primary update_button" data-bookid="' + book.id + '">Update</button> ';
          }
          if (response.permision_list.includes('delete_book')) {
            actions += '<button class="btn btn-danger delete_button" data-bookid="' + book.id + '">Delete</button>';
          }
          row.append('<td>' + actions + '</td>');
          tbody.append(row);
        });

        // Rebind events after the table is updated
        bindEventHandlers();
      },
      error: function(xhr, status, error) {
        console.error('AJAX Error:', status, error);
      }
    });
  }

  function bindEventHandlers() {
    // Delete button click handler
    $('.delete_button').off('click').on('click', function() {
      const bookid = $(this).data("bookid");
      const $button = $(this);

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {

          $.ajax({
            headers: {
              'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val()
            },
            type: "POST",
            url: "/library/delete/",
            data: {
              book_id: bookid
            },
            success: function(data) {
              Swal.fire({
                title: "Deleted!",
                text: "Book has been deleted.",
                icon: "success"
              });
              console.log(data);
              $button.closest('tr').remove();
            },
            error: function(xhr, status, error) {
              console.error('AJAX Error:', status, error);
            }
          });
        }
      });
      
    });

    // Update button click handler
    $('.update_button').off('click').on('click', function() {
      $('#exampleModalLabel').text('Book Update');
      // $('#save_button').attr('data-status', 'update');
      $('#update_save_button').show();
      $('#save_button').hide();
      
      const bookid = $(this).data("bookid");
      
      $.ajax({
        headers: {
          'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val()
        },
        type: "POST",
        url: "/library/update/",
        data: {
          book_id: bookid,
          'status': 1
        },
        success: function(data) {
          console.log(data);
          $("#exampleModal").modal('show');
          $('#update_id').val(data.data.id);
          $('#title').val(data.data.title);
          $('#desc').val(data.data.description);
        },
        error: function(xhr, status, error) {
          console.error('AJAX Error:', status, error);
        }
      });
    });

    // Create button click handler
    $('#create_button').off('click').on('click', function() {
      $('#exampleModalLabel').text('Book Create');
      // $('#save_button').attr('data-status', 'create');
      $('#update_id').val('');
      $('#title').val('');
      $('#desc').val('');
      $('#update_save_button').hide();
      $('#save_button').show();
    });

    // Save button click handler
    $('#save_button').off('click').on('click', function() {
      const title = $('#title').val();
      const description = $('#desc').val();

      if (title.trim().length < 1 || description.trim().length < 1) {
        $('#error_message').text('All fields are mandatory');
        return; 
      }

      $.ajax({
        headers: {
          'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val()
        },
        type: "POST",
        url: `/library/create/`,
        data: {
          title: title,
          description: description
        },
        success: function(data) {
          console.log(data);
          $("#exampleModal").modal('hide');
          $(this).removeAttr('data-status');
          GetData();
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "New book has been saved",
            showConfirmButton: false,
            timer: 1500
          });
        },
        error: function(xhr, status, error) {
          console.error('AJAX Error:', status, error);
          $("#exampleModal").modal('hide');
          Swal.fire("Book already exists", "", "info");

        }
      });
    });


    // update save  button click handler
    $('#update_save_button').off('click').on('click', function() {
      const bookid = $('#update_id').val();
      const title = $('#title').val();
      const description = $('#desc').val();

      if (title.trim().length < 1 || description.trim().length < 1) {
        $('#error_message').text('All fields are mandatory');
        return; 
      }

      Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        console.log("result : ", result)
        if (result.isConfirmed) {
          $.ajax({
            headers: {
              'X-CSRFToken': $('[name="csrfmiddlewaretoken"]').val()
            },
            type: "POST",
            url: `/library/update/`,
            data: {
              book_id: bookid,
              title: title,
              description: description
            },
            success: function(data) {
              console.log(data);
              $("#exampleModal").modal('hide');
              GetData();
              Swal.fire("Saved!", "", "success");
            },
            error: function(xhr, status, error) {
              console.error('AJAX Error:', status, error);
              Swal.fire("Something went wrong", "", "info");
            }
          });

        } else if (result.isDenied) {
          $("#exampleModal").modal('hide');
          Swal.fire("Changes are not saved", "", "info");
        }
      });

    });

    $('#search').keyup(function(){
      search_value = $('#search').val().trim();
      GetData(search_value);
    })
  }

});
