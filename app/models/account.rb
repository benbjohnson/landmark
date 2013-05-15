class Account < ActiveRecord::Base
  has_many :users
  validates :name, :presence => true  
  before_create :generate_api_key

  attr_accessible :name

  ##############################################################################
  #
  # Methds
  #
  ##############################################################################

  # Generates an API key for the account.
  def generate_api_key
    self.api_key = SecureRandom.hex(16)
  end
end
