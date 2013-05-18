class User < ActiveRecord::Base
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  belongs_to :account
  validates :account, :presence => true

  attr_accessible :email, :password, :password_confirmation, :remember_me
end
