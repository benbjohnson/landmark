require 'functional/test_helper'

class ProjectsControllerTest < ActionController::TestCase
  setup do
    sky_delete_test_tables()
    setup_account()
  end

  teardown do
    sky_delete_test_tables()
  end

  def test_auth_when_signed_in
    sign_in(@user)
    get :auth, {'apiKey' => @project.api_key}
    assert_response 200
    assert_equal({'status' => 'ok'}, JSON.parse(response.body))
  end

  def test_auth_when_signed_in_but_not_authorized
    sign_in(@user)
    get :auth, {'apiKey' => 'bad_key'}
    assert_response 404
  end

  def test_auth_when_signed_out
    get :auth, {'apiKey' => 'bad_key'}
    assert_response 404
  end

  def test_auth_demo
    get :auth, {'apiKey' => 'demo'}
    assert_response 200
  end
end
