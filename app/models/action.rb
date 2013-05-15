class Action < ActiveRecord::Base
  belongs_to :account
  validates :name, :presence => true  
  attr_accessible :name
end
