class User < ActiveRecord::Base
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  belongs_to :account
  validates :account_id, :presence => true  

  attr_accessible :email, :password, :password_confirmation, :remember_me
  attr_accessible :first_name, :last_name
end
