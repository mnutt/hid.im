class PiingsController < ApplicationController
  def new
    @piing = Piing.new
  end
  
  def create
    @piing = Piing.create( params[:piing] )
    redirect_to @piing
  end

  def show
    @piing = Piing.find params[:id]
  end

  def index
    @piing = Piing.new

    @piings = Piing.featured.find(:all, :limit => 10, :order => "created_at DESC")
  end
end
